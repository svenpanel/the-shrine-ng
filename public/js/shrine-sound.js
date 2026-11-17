// @ts-check

import { mediaPath } from './sounds.js'

/**
 * <shrine-sound file="30_laune1.mp3" label="Gude Laune">
 * Plays /sounds/<file> when its button is pressed (click, Enter or Space) or the
 * decorative knob below it is tapped. Sounds overlap on purpose.
 * A long-press or right-click (contextmenu) shares the direct mp3 URL instead.
 */

/**
 * Share a sound's absolute mp3 URL: native share sheet when available, else clipboard.
 * @param {{ label: string, url: string }} sound
 * @param {Pick<Navigator, 'share' | 'canShare' | 'clipboard'>} nav
 * @returns {Promise<'shared' | 'copied' | 'cancelled' | 'failed'>}
 */
export async function shareSound ({ label, url }, nav) {
  const data = { title: label, url }
  if (nav.share && nav.canShare?.(data)) {
    try {
      await nav.share(data)
      return 'shared'
    } catch (error) {
      if (error?.name === 'AbortError') return 'cancelled'
    }
  }
  try {
    await nav.clipboard.writeText(url)
    return 'copied'
  } catch (error) {
    console.warn('could not share sound', error)
    return 'failed'
  }
}
export class ShrineSound extends HTMLElement {
  connectedCallback () {
    if (this.hasChildNodes()) return

    // the one real control: focusable, named by its text
    const name = document.createElement('button')
    name.type = 'button'
    name.className = 'index__sound-name'
    name.textContent = this.getAttribute('label')

    // the knob only decorates the button; tapping it still plays
    const knob = document.createElement('div')
    knob.className = 'index__sound-knob'
    knob.setAttribute('aria-hidden', 'true')

    this.append(name, knob)
    this.addEventListener('click', () => {
      if (this.heldClick) return (this.heldClick = false)
      this.play()
    })

    // iOS WebKit rarely fires contextmenu on touch, so a touch hold shares from pointerup,
    // where the transient user activation navigator.share needs is still granted
    let hold = null
    name.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse') return
      hold = { time: event.timeStamp, x: event.clientX, y: event.clientY }
    })
    name.addEventListener('pointermove', (event) => {
      if (hold && Math.hypot(event.clientX - hold.x, event.clientY - hold.y) > 10) hold = null
    })
    name.addEventListener('pointercancel', () => { hold = null })
    name.addEventListener('pointerup', (event) => {
      const held = hold && event.timeStamp - hold.time >= 500
      hold = null
      if (!held) return
      this.heldClick = true // swallow the click that follows (if none comes, expire)
      setTimeout(() => { this.heldClick = false }, 400)
      this.share(name)
    })
    // mouse and desktop path; a touch hold is shared by pointerup instead
    name.addEventListener('contextmenu', (event) => {
      event.preventDefault()
      if (!hold && !this.heldClick) this.share(name)
    })
  }

  async share (name) {
    const url = new URL(mediaPath('sounds', this.getAttribute('file')), location.origin).href
    const result = await shareSound({ label: this.getAttribute('label'), url }, navigator)
    if (result !== 'copied') return
    name.classList.add('is-copied')
    setTimeout(() => name.classList.remove('is-copied'), 600)
  }

  play () {
    const audio = new Audio(mediaPath('sounds', this.getAttribute('file')))
    // in the DOM while playing, so page-level code can see (and listen to) running sounds
    for (const type of ['ended', 'error']) audio.addEventListener(type, () => audio.remove())
    this.append(audio)
    audio.play().catch(() => audio.remove())
  }
}

customElements.define('shrine-sound', ShrineSound)
