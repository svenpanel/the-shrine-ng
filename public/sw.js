// @ts-check
/// <reference lib="webworker" />

// Classic worker (module workers are not widely available yet), so it stays self-contained.
// Sounds and grooves are precached from sounds.json / grooves.json, which are the single
// source of truth for the media. Everything else in SHELL is listed by hand; test/sw.test.js
// fails when a file in public/ or public/js is missing from it.
// Bump VERSION to drop the old caches on the next deploy.
const VERSION = 'v1'
const CACHE_PREFIX = 'the-shrine-ng-'
const CACHE = `${CACHE_PREFIX}${VERSION}`

const SHELL = [
  '/',
  '/style.css',
  '/js/app.js',
  '/js/shrine-groove.js',
  '/js/shrine-sound.js',
  '/js/sounds.js',
  '/js/sw-register.js',
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
    const urls = [
      ...SHELL,
      ...(await mediaUrls('sounds', '/sounds.json')),
      ...(await mediaUrls('grooves', '/grooves.json'))
    ]
    const cache = await caches.open(CACHE)
    await cache.addAll(urls)
    await sw.skipWaiting()
  })())
})

sw.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith(CACHE_PREFIX) && key !== CACHE) await caches.delete(key)
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
  else if (/^\/(sounds|grooves|fonts)\//.test(url.pathname)) event.respondWith(cacheFirst(request))
  else event.respondWith(networkFirst(request))
})

/** Online: fresh page (via navigation preload when available). Offline: the cached "/". */
async function navigate (/** @type {FetchEvent} */ event) {
  try {
    return (await event.preloadResponse) || (await fetch(event.request))
  } catch {
    return (await caches.match('/')) || Response.error()
  }
}

async function networkFirst (/** @type {Request} */ request) {
  const cache = await caches.open(CACHE)
  try {
    const response = await fetch(request)
    if (response.ok) await cache.put(request, response.clone())
    return response
  } catch (error) {
    const cached = await cache.match(request, { ignoreSearch: true })
    if (cached) return cached
    throw error
  }
}

async function cacheFirst (/** @type {Request} */ request) {
  const cached = await caches.match(request, { ignoreSearch: true })
  if (!cached) return fetch(request)
  return request.headers.has('range') ? sliceRange(request, cached) : cached
}

/** Media elements (Safari in particular) ask for byte ranges; the cache only holds full responses. */
async function sliceRange (/** @type {Request} */ request, /** @type {Response} */ response) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('range') ?? '')
  if (!match) return response
  const body = await response.arrayBuffer()
  const size = body.byteLength
  const start = match[1] === '' ? Math.max(size - Number(match[2]), 0) : Number(match[1])
  const end = match[1] === '' || match[2] === '' ? size - 1 : Math.min(Number(match[2]), size - 1)
  return new Response(body.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': response.headers.get('Content-Type') ?? 'audio/mpeg',
      'Content-Range': `bytes ${start}-${end}/${size}`
    }
  })
}
