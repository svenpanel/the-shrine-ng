// @ts-check

/**
 * <shrine-sound file="30_laune1.mp3" label="Gude Laune">
 * Plays /sounds/<file> on click, Enter or Space. Sounds overlap on purpose.
 */
export class ShrineSound extends HTMLElement {
  connectedCallback () {
    this.setAttribute('role', 'article') // the original markup was an <article>
    if (this.hasChildNodes()) return

    const name = document.createElement('button')
    name.type = 'button'
    name.className = 'index__sound-name'
    name.textContent = this.getAttribute('label')

    const knob = document.createElement('button')
    knob.type = 'button'
    knob.className = 'index__sound-knob'
    knob.setAttribute('aria-label', this.getAttribute('label') ?? '')

    this.append(name, document.createElement('div'))
    this.lastElementChild?.append(knob)

    this.addEventListener('click', () => this.play())
    this.addEventListener('keydown', (event) => {
      if (event.target !== this || (event.key !== 'Enter' && event.key !== ' ')) return
      event.preventDefault()
      this.play()
    })
  }

  play () {
    new Audio(`/sounds/${this.getAttribute('file')}`).play().catch(() => {})
  }
}

customElements.define('shrine-sound', ShrineSound)
