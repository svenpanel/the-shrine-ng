// @ts-check

/** @typedef {import('./sounds.js').CatalogEntry} CatalogEntry */

/**
 * <shrine-groove>: set `.grooves` to a catalog. One button per groove toggles
 * looped playback of /grooves/<file>; the playing row owns its <audio>, so CSS
 * reads the state with :has(> audio). Title and play/pause go to the Media Session.
 */
export class ShrineGroove extends HTMLElement {
  /** @type {HTMLAudioElement | null} */
  #audio = null

  /** @param {CatalogEntry[]} grooves */
  set grooves (grooves) {
    this.#stop()
    this.replaceChildren(...grooves.map((groove) => this.#row(groove)))
  }

  /** @param {CatalogEntry} groove */
  #row (groove) {
    const button = document.createElement('button')
    button.type = 'button'
    button.tabIndex = 2
    button.innerHTML = `
      <span>
        <span class="groove-player__button"></span>
        <span class="groove-player__display groove-player__idle">Play a groove</span>
        <span class="groove-player__display groove-player__marquee"><span></span></span>
      </span>`
    button.querySelector('.groove-player__marquee > span').textContent = groove.name
    button.addEventListener('click', () => {
      const wasPlaying = button.contains(this.#audio)
      this.#stop()
      if (!wasPlaying) this.#start(button, groove)
    })
    return button
  }

  /**
   * @param {HTMLButtonElement} button
   * @param {CatalogEntry} groove
   */
  #start (button, groove) {
    const audio = new Audio(`/grooves/${groove.file}`)
    audio.loop = true
    button.append(audio)
    this.#audio = audio
    audio.play().catch(() => this.#stop())

    if ('mediaSession' in navigator) {
      const session = navigator.mediaSession
      session.metadata = new MediaMetadata({
        title: groove.name,
        artist: 'The Shrine',
        artwork: [{ src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' }]
      })
      session.playbackState = 'playing'
      session.setActionHandler('play', () => audio.play())
      session.setActionHandler('pause', () => this.#stop())
      session.setActionHandler('stop', () => this.#stop())
    }
  }

  #stop () {
    this.#audio?.pause()
    this.#audio?.remove()
    this.#audio = null
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'none'
      navigator.mediaSession.metadata = null
    }
  }
}

customElements.define('shrine-groove', ShrineGroove)
