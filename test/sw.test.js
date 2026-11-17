import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdtempSync, readFileSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import vm from 'node:vm'
import assert from 'node:assert/strict'

const rootDir = join(import.meta.dirname, '..')
const publicDir = join(rootDir, 'public')
const stampScript = join(rootDir, '.github', 'stamp-sw.sh')
const origin = 'http://localhost'
const mp3s = (dir) => readdirSync(join(publicDir, dir)).filter((f) => f.endsWith('.mp3'))
const pathOf = (input) => new URL(typeof input === 'string' ? input : input.url, origin).pathname

/** Copies sw.js to a temp dir and runs the workflow's stamp script on it. */
function stampedCopy (sha) {
  const copy = join(mkdtempSync(join(tmpdir(), 'shrine-sw-')), 'sw.js')
  copyFileSync(join(publicDir, 'sw.js'), copy)
  execFileSync('sh', [stampScript, copy, publicDir], { env: { ...process.env, GITHUB_SHA: sha } })
  return copy
}

/** Same bytes the stamp script hashes: sorted "path\n" + content for every media file. */
function expectedMediaHash () {
  const hash = createHash('sha256')
  const files = ['sounds', 'grooves'].flatMap((dir) => mp3s(dir).map((f) => `${dir}/${f}`)).sort()
  for (const file of files) hash.update(`${file}\n`).update(readFileSync(join(publicDir, file)))
  return hash.digest('hex').slice(0, 12)
}

/** Runs a service worker file against in-memory caches; `store` can be shared across workers. */
function loadWorker ({ file = join(publicDir, 'sw.js'), store = new Map(), putFails = false } = {}) {
  const handlers = {}
  const calls = []
  const deleted = []
  const addAllBatches = []
  const caches = {
    open: async (name) => {
      if (!store.has(name)) store.set(name, new Map())
      const entries = store.get(name)
      return {
        addAll: async (requests) => {
          addAllBatches.push({ name, paths: requests.map(pathOf), reload: requests.every((r) => r.cache === 'reload') })
          for (const request of requests) entries.set(pathOf(request), new Response(`body of ${pathOf(request)}`))
        },
        put: async (key, response) => {
          if (putFails) throw new Error('QuotaExceededError')
          entries.set(pathOf(key), response)
        },
        match: async (request) => entries.get(pathOf(request))?.clone(),
        keys: async () => [...entries.keys()].map((path) => ({ url: origin + path }))
      }
    },
    keys: async () => [...store.keys()],
    delete: async (name) => { deleted.push(name); store.delete(name) }
  }
  const self = {
    addEventListener: (type, fn) => { handlers[type] = fn },
    skipWaiting: async () => { calls.push('skipWaiting') },
    clients: { claim: async () => { calls.push('claim') } },
    registration: { navigationPreload: { enable: async () => { calls.push('navigationPreload') } } },
    location: { origin }
  }
  const network = { offline: false, gate: null }
  const fetches = []
  const diskFetch = async (input, init) => {
    fetches.push({ path: pathOf(input), init })
    if (network.offline) throw new TypeError('offline')
    if (network.gate) await network.gate
    const path = join(publicDir, pathOf(input) === '/' ? 'index.html' : pathOf(input))
    return existsSync(path) ? new Response(readFileSync(path)) : new Response(null, { status: 404 })
  }
  const context = vm.createContext({ self, URL, Request, Response, caches, fetch: diskFetch })
  vm.runInContext(readFileSync(file, 'utf8'), context)

  const lifecycle = async (type) => {
    const pending = []
    handlers[type]({ waitUntil: (promise) => pending.push(promise) })
    await Promise.all(pending)
  }
  const fetchEvent = async (request) => {
    let answer
    const pending = []
    handlers.fetch({
      request,
      respondWith: (promise) => { answer = promise },
      waitUntil: (promise) => pending.push(promise)
    })
    const response = await answer
    await Promise.all(pending)
    return response
  }
  return { store, network, fetches, calls, deleted, addAllBatches, install: () => lifecycle('install'), activate: () => lifecycle('activate'), fetchEvent }
}

const mediaName = `media-${expectedMediaHash()}`
const stampedWorker = (options = {}) => loadWorker({ file: stampedCopy('0123456789abcdef'), ...options })
const get = (path, headers) => new Request(origin + path, { headers })

test('stamp script replaces both tokens with the commit and the media hash', () => {
  const stamped = readFileSync(stampedCopy('0123456789abcdef'), 'utf8')

  assert.ok(readFileSync(join(publicDir, 'sw.js'), 'utf8').includes('__VERSION__'), 'source keeps its tokens')
  assert.ok(!stamped.includes('__VERSION__') && !stamped.includes('__MEDIA_HASH__'))
  assert.ok(stamped.includes("stamped('01234567')"))
  assert.ok(stamped.includes(`stamped('${expectedMediaHash()}')`))
})

test('install splits shell and media caches and precaches every file on disk', async () => {
  const worker = loadWorker({ file: stampedCopy('0123456789abcdef') })
  await worker.install()

  const shell = [...worker.store.get('shell-01234567').keys()]
  const media = [...worker.store.get(`media-${expectedMediaHash()}`).keys()]
  for (const dir of ['sounds', 'grooves']) {
    for (const file of mp3s(dir)) assert.ok(media.includes(`/${dir}/${file}`), `${dir}/${file}`)
  }
  assert.ok(media.every((path) => /^\/(sounds|grooves)\//.test(path)))
  assert.ok(shell.includes('/') && shell.includes('/fonts/Keania_One/KeaniaOne-Regular.woff2'))
  assert.ok(shell.every((path) => !/^\/(sounds|grooves)\//.test(path)))
  assert.ok(worker.calls.includes('skipWaiting'))
})

test('shell lists every css, js and font file the page ships', async () => {
  const worker = loadWorker()
  await worker.install()
  const shell = [...worker.store.get('shell-dev').keys()]

  // apple-touch-icon and the splash images stay out: iOS fetches them itself at add-to-home
  const html = readFileSync(join(publicDir, 'index.html'), 'utf8')
  const referenced = [/<link rel="stylesheet" href="([^"]+)"/, /<script type="module" src="([^"]+)"/, /<link rel="icon" href="([^"]+)"/, /<link rel="manifest" href="([^"]+)"/]
    .map((pattern) => html.match(pattern)?.[1])
  const manifest = JSON.parse(readFileSync(join(publicDir, 'manifest.webmanifest'), 'utf8'))
  const expected = [
    ...referenced,
    ...manifest.icons.map((icon) => `/${icon.src}`),
    ...readdirSync(join(publicDir, 'js')).map((file) => `/js/${file}`),
    ...readdirSync(join(publicDir, 'fonts', 'Keania_One')).filter((f) => /\.(woff2|ttf)$/.test(f)).map((f) => `/fonts/Keania_One/${f}`)
  ]
  assert.ok(referenced.every(Boolean), 'index.html references')
  for (const url of expected) assert.ok(shell.includes(url), url)
  for (const url of shell) assert.ok(existsSync(join(publicDir, url === '/' ? 'index.html' : url)), `${url} exists`)
})

test('a new deploy replaces the shell cache and keeps media whose hash is unchanged', async () => {
  const store = new Map([['the-shrine-ng-prod', new Map()], ['shell-oldoldol', new Map()]])
  const first = loadWorker({ file: stampedCopy('aaaaaaaa11111111'), store })
  await first.install()
  await first.activate()

  const second = loadWorker({ file: stampedCopy('bbbbbbbb22222222'), store })
  await second.install()
  await second.activate()

  assert.deepEqual([...store.keys()].sort(), [`media-${expectedMediaHash()}`, 'shell-bbbbbbbb'])
  assert.ok(first.deleted.includes('the-shrine-ng-prod') && first.deleted.includes('shell-oldoldol'))
  assert.deepEqual(second.deleted, ['shell-aaaaaaaa'])
  assert.ok(second.addAllBatches.some(({ name, paths }) => name.startsWith('media-') && paths.length === 0), 'media not re-downloaded')
  assert.deepEqual(second.calls.filter((call) => call !== 'skipWaiting').sort(), ['claim', 'navigationPreload'])
})

test('precache requests bypass the HTTP cache', async () => {
  const worker = stampedWorker()
  await worker.install()

  assert.ok(worker.addAllBatches.length >= 2)
  assert.ok(worker.addAllBatches.every(({ reload }) => reload))
})

test('cache-first media: miss is fetched whole, stored and then served from the cache', async () => {
  const worker = stampedWorker()
  const file = mp3s('sounds')[0]

  const response = await worker.fetchEvent(get(`/sounds/${file}`))
  assert.equal(response.status, 200)
  assert.ok(worker.store.get(mediaName).has(`/sounds/${file}`))
})

test('range requests on cached media: 206 slice, 416 past the end, full body for bytes=-', async () => {
  const worker = stampedWorker()
  const file = mp3s('sounds')[0]
  const size = readFileSync(join(publicDir, 'sounds', file)).byteLength
  await worker.fetchEvent(get(`/sounds/${file}`))

  const slice = await worker.fetchEvent(get(`/sounds/${file}`, { range: 'bytes=0-3' }))
  assert.equal(slice.status, 206)
  assert.equal(slice.headers.get('content-range'), `bytes 0-3/${size}`)
  assert.equal((await slice.arrayBuffer()).byteLength, 4)

  const past = await worker.fetchEvent(get(`/sounds/${file}`, { range: `bytes=${size}-` }))
  assert.equal(past.status, 416)
  assert.equal(past.headers.get('content-range'), `bytes */${size}`)

  const open = await worker.fetchEvent(get(`/sounds/${file}`, { range: 'bytes=-' }))
  assert.equal(open.status, 200)
  assert.equal((await open.arrayBuffer()).byteLength, size)
})

test('range request on an uncached file fetches it whole and caches it', async () => {
  const worker = stampedWorker()
  const file = mp3s('grooves')[0]

  const slice = await worker.fetchEvent(get(`/grooves/${file}`, { range: 'bytes=0-9' }))
  assert.equal(slice.status, 206)
  assert.ok(worker.store.get(mediaName).has(`/grooves/${file}`))
})

test('shell files are served stale and refreshed in the background', async () => {
  const worker = loadWorker()
  await worker.install()
  worker.store.get('shell-dev').set('/style.css', new Response('stale css'))

  const response = await worker.fetchEvent(get('/style.css?v=2'))
  assert.equal(await response.text(), 'stale css')
  const refreshed = await worker.store.get('shell-dev').get('/style.css').text()
  assert.equal(refreshed, readFileSync(join(publicDir, 'style.css'), 'utf8'))
})

test('navigations are cached as "/" and fall back to it offline', async () => {
  const worker = loadWorker()
  const navigation = { method: 'GET', url: `${origin}/?standalone=true`, mode: 'navigate', headers: new Headers() }

  const online = await worker.fetchEvent(navigation)
  assert.equal(online.status, 200)
  assert.equal(await worker.store.get('shell-dev').get('/').clone().text(), readFileSync(join(publicDir, 'index.html'), 'utf8'))

  worker.network.offline = true
  const offline = await worker.fetchEvent(navigation)
  assert.equal(await offline.text(), readFileSync(join(publicDir, 'index.html'), 'utf8'))
})

test('stale-while-revalidate and navigation fetches revalidate instead of trusting the HTTP cache', async () => {
  const worker = loadWorker()
  await worker.install()
  worker.fetches.length = 0

  await worker.fetchEvent(get('/style.css'))
  await worker.fetchEvent({ method: 'GET', url: `${origin}/`, mode: 'navigate', headers: new Headers() })

  assert.equal(worker.fetches.length, 2)
  for (const { init } of worker.fetches) assert.equal(init?.cache, 'no-cache')
})

test('unstamped (dev) worker: no media precache, network first, cache only as offline fallback', async () => {
  const worker = loadWorker()
  const file = mp3s('sounds')[0]
  const disk = readFileSync(join(publicDir, 'sounds', file))
  await worker.install()
  assert.ok(!worker.store.has('media-dev'), 'nothing precached')

  worker.store.set('media-dev', new Map([[`/sounds/${file}`, new Response('stale audio')]]))
  const online = await worker.fetchEvent(get(`/sounds/${file}`))
  assert.deepEqual(Buffer.from(await online.arrayBuffer()), disk, 'replaced audio wins over the cache')
  assert.equal(worker.fetches.at(-1).init.cache, 'no-cache')

  worker.network.offline = true
  const offline = await worker.fetchEvent(get(`/sounds/${file}`))
  assert.deepEqual(Buffer.from(await offline.arrayBuffer()), disk, 'offline falls back to the refreshed copy')
})

test('concurrent range misses share one download', async () => {
  const worker = stampedWorker()
  const file = mp3s('sounds')[0]
  let open
  worker.network.gate = new Promise((resolve) => { open = resolve })

  const both = Promise.all([
    worker.fetchEvent(get(`/sounds/${file}`, { range: 'bytes=0-1' })),
    worker.fetchEvent(get(`/sounds/${file}`, { range: 'bytes=2-3' }))
  ])
  await new Promise((resolve) => setTimeout(resolve, 20))
  open()
  const [first, second] = await both

  assert.equal(worker.fetches.filter(({ path }) => path === `/sounds/${file}`).length, 1)
  assert.equal(first.status, 206)
  assert.equal(second.headers.get('content-range').startsWith('bytes 2-3/'), true)

  await worker.fetchEvent(get(`/sounds/${file}`)) // the entry was released: a later miss would fetch again
  assert.equal(worker.fetches.filter(({ path }) => path === `/sounds/${file}`).length, 1, 'now served from cache')
})

test('only 200 responses are cached and a failing put never breaks the response', async () => {
  const missing = stampedWorker()
  const notFound = await missing.fetchEvent(get('/sounds/nope.mp3'))
  assert.equal(notFound.status, 404)
  assert.ok(!missing.store.get(mediaName)?.has('/sounds/nope.mp3'))

  const file = mp3s('sounds')[0]
  const quota = stampedWorker({ putFails: true })
  const media = await quota.fetchEvent(get(`/sounds/${file}`))
  assert.equal(media.status, 200)
  assert.equal((await media.arrayBuffer()).byteLength, readFileSync(join(publicDir, 'sounds', file)).byteLength)

  const page = await quota.fetchEvent({ method: 'GET', url: `${origin}/`, mode: 'navigate', headers: new Headers() })
  assert.equal(page.status, 200)
  const css = await quota.fetchEvent(get('/style.css'))
  assert.equal(css.status, 200)
})

test('stamp script fails when the media cannot be hashed and leaves the worker untouched', () => {
  const copy = join(mkdtempSync(join(tmpdir(), 'shrine-sw-')), 'sw.js')
  copyFileSync(join(publicDir, 'sw.js'), copy)
  const emptyPublic = mkdtempSync(join(tmpdir(), 'shrine-empty-'))

  assert.throws(() => execFileSync('sh', [stampScript, copy, emptyPublic], { env: { ...process.env, GITHUB_SHA: '0123456789abcdef' }, stdio: 'pipe' }))
  assert.equal(readFileSync(copy, 'utf8'), readFileSync(join(publicDir, 'sw.js'), 'utf8'))
})
