// @ts-check
/// <reference lib="webworker" />

// Classic worker (module workers are not widely available yet), so it stays self-contained.
//
// Two caches, two lifetimes:
//   shell-<VERSION>      html, css, js, icons, fonts; replaced on every deploy
//   media-<MEDIA_HASH>   sounds and grooves; replaced only when a media file changes
// The deploy workflow stamps both tokens via .github/stamp-sw.sh; unstamped (dev) they are "dev".
// Media is precached from sounds.json / grooves.json, the single source of truth for it.
// SHELL is listed by hand; test/sw.test.js fails when a file in public/ or public/js is missing.
const stamped = (/** @type {string} */ value) => (value.startsWith('__') ? 'dev' : value)
const SHELL_CACHE = `shell-${stamped('__VERSION__')}`
const MEDIA_CACHE = `media-${stamped('__MEDIA_HASH__')}`

const SHELL = [
  '/',
  '/style.css',
  '/js/app.js',
  '/js/shrine-groove.js',
  '/js/shrine-sound.js',
  '/js/sounds.js',
  '/sounds.json',
  '/grooves.json',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/pwa-64x64.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/maskable-icon-512x512.png',
  '/fonts/Keania_One/KeaniaOne-Regular.woff2',
  '/fonts/Keania_One/KeaniaOne-Regular.ttf'
]

const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self))

const pathOf = (/** @type {string} */ url) => new URL(url, sw.location.origin).pathname
/** A request that bypasses the HTTP cache, so precaching never stores stale bytes. */
const fresh = (/** @type {string} */ url) => new Request(new URL(url, sw.location.origin), { cache: 'reload' })

/**
 * @param {string} dir
 * @param {string} catalogUrl
 * @returns {Promise<string[]>}
 */
async function mediaUrls (dir, catalogUrl) {
  const response = await fetch(catalogUrl, { cache: 'no-cache' })
  if (!response.ok) throw new Error(`${catalogUrl}: ${response.status}`)
  /** @type {{ file: string }[]} */
  const entries = await response.json()
  return entries.map(({ file }) => `/${dir}/${file}`)
}

sw.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const media = [
      ...(await mediaUrls('sounds', '/sounds.json')),
      ...(await mediaUrls('grooves', '/grooves.json'))
    ]
    const shellCache = await caches.open(SHELL_CACHE)
    await shellCache.addAll(SHELL.map(fresh))

    // an unchanged media hash means the media cache is already complete
    const mediaCache = await caches.open(MEDIA_CACHE)
    const have = new Set((await mediaCache.keys()).map((request) => pathOf(request.url)))
    await mediaCache.addAll(media.filter((url) => !have.has(pathOf(url))).map(fresh))
    await sw.skipWaiting()
  })())
})

sw.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key !== SHELL_CACHE && key !== MEDIA_CACHE) await caches.delete(key)
    }
    await sw.registration.navigationPreload?.enable()
    await sw.clients.claim()
  })())
})

sw.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== sw.location.origin) return

  if (request.mode === 'navigate') event.respondWith(navigate(event))
  else if (/^\/(sounds|grooves)\//.test(url.pathname)) event.respondWith(cacheFirst(request, MEDIA_CACHE))
  else if (url.pathname.startsWith('/fonts/')) event.respondWith(cacheFirst(request, SHELL_CACHE))
  else event.respondWith(staleWhileRevalidate(event))
})

/** Online: a fresh page (navigation preload when available), kept as the offline "/". */
async function navigate (/** @type {FetchEvent} */ event) {
  const cache = await caches.open(SHELL_CACHE)
  try {
    const response = (await event.preloadResponse) || (await fetch(event.request))
    if (response.ok && pathOf(event.request.url) === '/') event.waitUntil(cache.put('/', response.clone()))
    return response
  } catch {
    return (await cache.match('/')) || Response.error()
  }
}

async function staleWhileRevalidate (/** @type {FetchEvent} */ event) {
  const cache = await caches.open(SHELL_CACHE)
  const cached = await cache.match(event.request, { ignoreSearch: true })
  const refresh = fetch(event.request).then(async (response) => {
    if (response.ok) await cache.put(event.request, response.clone())
    return response
  })
  if (!cached) return refresh
  event.waitUntil(refresh.catch(() => {}))
  return cached
}

async function cacheFirst (/** @type {Request} */ request, /** @type {string} */ cacheName) {
  const cache = await caches.open(cacheName)
  const ranged = request.headers.has('range')
  const cached = await cache.match(request, { ignoreSearch: true })
  if (cached) return ranged ? sliceRange(request, cached) : cached

  // miss: fetch the whole file (never a partial one), keep it, answer the range from it
  const response = await fetch(ranged ? request.url : request)
  if (response.status !== 200) return response
  await cache.put(request.url, response.clone())
  return ranged ? sliceRange(request, response) : response
}

/** Media elements (Safari in particular) ask for byte ranges; the cache only holds full responses. */
async function sliceRange (/** @type {Request} */ request, /** @type {Response} */ response) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('range') ?? '')
  if (!match || (match[1] === '' && match[2] === '')) return response

  const body = await response.arrayBuffer()
  const size = body.byteLength
  const start = match[1] === '' ? Math.max(size - Number(match[2]), 0) : Number(match[1])
  const end = match[1] === '' || match[2] === '' ? size - 1 : Math.min(Number(match[2]), size - 1)
  if (start >= size) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } })
  if (end < start) return response

  return new Response(body.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': response.headers.get('Content-Type') ?? 'audio/mpeg',
      'Content-Range': `bytes ${start}-${end}/${size}`
    }
  })
}
