// @ts-check
import { loadCatalog } from './sounds.js'
import './shrine-sound.js'
import './shrine-groove.js'
import { registerServiceWorker } from './sw-register.js'

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

registerServiceWorker()
