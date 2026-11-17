// @ts-check
import { loadCatalog } from './sounds.js'
import './shrine-sound.js'
import './shrine-groove.js'

// Register first: a failed catalog fetch must not keep the offline worker from installing.
// A new worker takes over via skipWaiting; reload so the page matches it, but never mid-sound:
// wait until playback pauses or ends (media events do not bubble, hence capture) or the tab is hidden with nothing playing.
if ('serviceWorker' in navigator) {
  const hadController = Boolean(navigator.serviceWorker.controller)
  let updateReady = false
  const idle = () => ![...document.querySelectorAll('audio')].some((audio) => !audio.paused)
  const reloadWhenIdle = () => { if (updateReady && idle()) location.reload() }
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) return
    updateReady = true
    reloadWhenIdle()
  })
  document.addEventListener('pause', reloadWhenIdle, true)
  document.addEventListener('visibilitychange', () => { if (document.hidden) reloadWhenIdle() })
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
