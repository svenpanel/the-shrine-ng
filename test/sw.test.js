import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import vm from 'node:vm'
import assert from 'node:assert/strict'

const publicDir = join(import.meta.dirname, '..', 'public')

/** Runs public/sw.js against a fake worker scope and returns the handlers plus what it cached. */
function loadWorker ({ existingCaches = [] } = {}) {
  const handlers = {}
  const cached = []
  const deleted = []
  const calls = []
  const fakeCache = { addAll: async (urls) => { cached.push(...urls) } }
  const self = {
    addEventListener: (type, fn) => { handlers[type] = fn },
    skipWaiting: async () => { calls.push('skipWaiting') },
    clients: { claim: async () => { calls.push('claim') } },
    registration: { navigationPreload: { enable: async () => { calls.push('navigationPreload') } } },
    location: { origin: 'http://localhost' }
  }
  const context = vm.createContext({
    self,
    URL,
    Response,
    caches: {
      open: async () => fakeCache,
      keys: async () => existingCaches,
      delete: async (key) => { deleted.push(key) }
    },
    fetch: async (url) => {
      const path = join(publicDir, url)
      return existsSync(path)
        ? { ok: true, json: async () => JSON.parse(readFileSync(path, 'utf8')) }
        : { ok: false, status: 404 }
    }
  })
  vm.runInContext(readFileSync(join(publicDir, 'sw.js'), 'utf8'), context)

  const run = async (type) => {
    const pending = []
    handlers[type]({ waitUntil: (promise) => pending.push(promise) })
    await Promise.all(pending)
  }
  return { run, cached, deleted, calls, handlers }
}

test('install precaches every sound and groove on disk, plus the shell', async () => {
  const worker = loadWorker()
  await worker.run('install')

  for (const dir of ['sounds', 'grooves']) {
    for (const file of readdirSync(join(publicDir, dir)).filter((f) => f.endsWith('.mp3'))) {
      assert.ok(worker.cached.includes(`/${dir}/${file}`), `${dir}/${file}`)
    }
  }
  assert.ok(worker.cached.includes('/fonts/Keania_One/KeaniaOne-Regular.woff2'))
  assert.ok(worker.cached.includes('/'))
  assert.ok(worker.calls.includes('skipWaiting'))
})

test('shell lists every html, css, js and font file the page ships', async () => {
  const worker = loadWorker()
  await worker.run('install')

  const expected = [
    '/style.css',
    ...readdirSync(join(publicDir, 'js')).map((file) => `/js/${file}`),
    ...readdirSync(join(publicDir, 'fonts', 'Keania_One')).filter((f) => /\.(woff2|ttf)$/.test(f)).map((f) => `/fonts/Keania_One/${f}`)
  ]
  for (const url of expected) assert.ok(worker.cached.includes(url), url)
  for (const url of worker.cached) assert.ok(existsSync(join(publicDir, url === '/' ? 'index.html' : url)), `${url} exists`)
})

test('activate drops old caches, claims clients and enables navigation preload', async () => {
  const worker = loadWorker({ existingCaches: ['the-shrine-ng-v0', 'the-shrine-ng-prod', 'other-app'] })
  await worker.run('activate')

  assert.deepEqual(worker.deleted.sort(), ['the-shrine-ng-prod', 'the-shrine-ng-v0'])
  assert.deepEqual(worker.calls.sort(), ['claim', 'navigationPreload'])
})
