// @ts-check

/**
 * <shrine-sound file="30_laune1.mp3" label="Gude Laune">
 * Plays /sounds/<file> when its button is pressed (click, Enter or Space) or the
 * decorative knob below it is tapped. Sounds overlap on purpose.
 */
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
    this.addEventListener('click', () => this.play())
  }

  play () {
    const audio = new Audio(`/sounds/${this.getAttribute('file')}`)
    // in the DOM while playing, so page-level code can see (and listen to) running sounds
    for (const type of ['ended', 'error']) audio.addEventListener(type, () => audio.remove())
    this.append(audio)
    audio.play().catch(() => audio.remove())
  }
}

customElements.define('shrine-sound', ShrineSound)
