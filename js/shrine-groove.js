// @ts-check

import { mediaPath } from './sounds.js'

/** @typedef {import('./sounds.js').CatalogEntry} CatalogEntry */

/**
 * <shrine-groove>: set `.grooves` to a catalog. One button per groove toggles
 * looped playback of /grooves/<file>; the playing row owns its <audio>, so CSS
 * reads the state with :has(> audio). Title and play/pause go to the Media Session.
 */
export class ShrineGroove extends HTMLElement {
  /** @type {HTMLAudioElement | null} */
  #audio = null

  connectedCallback () {
    this.setAttribute('role', 'complementary') // the original markup was an <aside>
  }

  /** @param {CatalogEntry[]} grooves */
  set grooves (grooves) {
    this.#stop()
    this.replaceChildren(...grooves.map((groove) => this.#row(groove)))
  }

  /** @param {CatalogEntry} groove */
  #row (groove) {
    const button = document.createElement('button')
    button.type = 'button'
    button.innerHTML = `
      <span>
        <span class="groove-player__button"></span>
        <span class="groove-player__display groove-player__idle">Play a groove</span>
        <span class="groove-player__display groove-player__marquee"><span></span></span>
      </span>`
    const marquee = button.querySelector('.groove-player__marquee > span')
    if (marquee) marquee.textContent = groove.name
    button.addEventListener('click', () => {
      const wasPlaying = button.contains(this.#audio)
      wasPlaying ? this.#stop() : this.#start(button, groove)
    })
    return button
  }

  /**
   * @param {HTMLButtonElement} button
   * @param {CatalogEntry} groove
   */
  #start (button, groove) {
    this.#stop()
    const audio = new Audio(mediaPath('grooves', groove.file))
    audio.loop = true
    button.append(audio)
    this.#audio = audio
    // a pause() that interrupts a stale play() must not stop whatever plays now
    audio.play().catch(() => { if (this.#audio === audio) this.#stop() })

    if ('mediaSession' in navigator) {
      const session = navigator.mediaSession
      session.metadata = new MediaMetadata({
        title: groove.name,
        artist: 'The Shrine',
        artwork: [{ src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' }]
      })
      session.playbackState = 'playing'
      session.setActionHandler('play', () => this.#start(button, groove))
      session.setActionHandler('pause', () => this.#stop())
      session.setActionHandler('stop', () => this.#stop())
    }
  }

  #stop () {
    const audio = this.#audio
    this.#audio = null
    if (audio?.paused === false) {
      // leave it in the DOM until its pause event has reached the page (see app.js)
      audio.addEventListener('pause', () => audio.remove(), { once: true })
      audio.pause()
    } else {
      audio?.remove()
    }
    if ('mediaSession' in navigator) {
      const session = navigator.mediaSession
      session.playbackState = 'none'
      session.metadata = null
      for (const action of /** @type {const} */ (['play', 'pause', 'stop'])) session.setActionHandler(action, null)
    }
  }
}

customElements.define('shrine-groove', ShrineGroove)
