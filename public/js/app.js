// @ts-check
import { loadCatalog } from './sounds.js'
import './shrine-sound.js'
import './shrine-groove.js'

// Register first: a failed catalog fetch must not keep the offline worker from installing.
// A new worker takes over via skipWaiting; reload once so the page matches it.
if ('serviceWorker' in navigator) {
  const hadController = Boolean(navigator.serviceWorker.controller)
  let reloading = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return
    reloading = true
    location.reload()
  })
  navigator.serviceWorker.register('/sw.js').catch((error) => console.warn('service worker', error))
}

const [sounds, grooves] = await Promise.all([loadCatalog('/sounds.json'), loadCatalog('/grooves.json')])

const board = document.getElementById('sounds')
board?.replaceChildren(
  ...sounds.map(({ file, name }, index) => {
    const sound = document.createElement('shrine-sound')
    sound.className = 'index__sound'
    sound.tabIndex = 1 + index
    sound.setAttribute('file', file)
    sound.setAttribute('label', name)
    return sound
  }),
  // invisible spacers keep the last row's buttons from stretching
  ...Array.from({ length: 6 }, () => Object.assign(document.createElement('div'), { className: 'index__sound', hidden: true }))
)

/** @type {import('./shrine-groove.js').ShrineGroove | null} */
const groovePlayer = document.querySelector('shrine-groove')
if (groovePlayer) groovePlayer.grooves = grooves
