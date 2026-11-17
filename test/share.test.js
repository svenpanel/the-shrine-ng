import { test } from 'node:test'
import assert from 'node:assert/strict'

class FakeElement {
  children = []
  attrs = {}
  listeners = {}
  className = ''
  textContent = ''
  hasChildNodes () { return this.children.length > 0 }
  getAttribute (name) { return this.attrs[name] ?? null }
  setAttribute (name, value) { this.attrs[name] = value }
  append (...nodes) { this.children.push(...nodes) }
  addEventListener (type, fn) { this.listeners[type] = fn }
}
globalThis.HTMLElement = FakeElement
globalThis.customElements = { define () {} }
globalThis.document = { createElement: (type) => Object.assign(new FakeElement(), { type }) }

const { shareSound, ShrineSound } = await import('../public/js/shrine-sound.js')
const sound = { label: 'Gude Laune', url: 'https://theshrine.pw/sounds/30_laune1.mp3' }

test('uses the share sheet when canShare allows it', async () => {
  const calls = []
  const nav = { canShare: () => true, share: async (d) => calls.push(d), clipboard: { writeText: async () => assert.fail() } }
  assert.equal(await shareSound(sound, nav), 'shared')
  assert.deepEqual(calls, [{ title: 'Gude Laune', url: sound.url }])
})

test('falls back to the clipboard when share is missing', async () => {
  const copied = []
  assert.equal(await shareSound(sound, { clipboard: { writeText: async (t) => copied.push(t) } }), 'copied')
  assert.deepEqual(copied, [sound.url])
})

test('a cancelled share is silent and does not copy', async () => {
  const nav = {
    canShare: () => true,
    share: async () => { throw new DOMException('cancelled', 'AbortError') },
    clipboard: { writeText: async () => assert.fail() }
  }
  assert.equal(await shareSound(sound, nav), 'cancelled')
})

test('warns and stays quiet when both share and clipboard fail', async () => {
  const warn = console.warn
  const warned = []
  console.warn = (...a) => warned.push(a)
  try {
    const nav = { canShare: () => true, share: async () => { throw new Error('x') }, clipboard: { writeText: async () => { throw new Error('y') } } }
    assert.equal(await shareSound(sound, nav), 'failed')
  } finally { console.warn = warn }
  assert.equal(warned.length, 1)
})

test('the shared URL is absolute and points at /sounds/<file>', async () => {
  globalThis.location = { origin: 'https://theshrine.pw' }
  const shared = []
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { canShare: () => true, share: async (d) => shared.push(d) } })
  const el = new ShrineSound()
  el.setAttribute('file', '30_laune1.mp3')
  el.setAttribute('label', 'Gude Laune')
  el.connectedCallback()
  await el.share(el.children[0])
  assert.deepEqual(shared, [{ title: 'Gude Laune', url: 'https://theshrine.pw/sounds/30_laune1.mp3' }])
})

test('contextmenu on the button prevents default and does not play', () => {
  globalThis.location = { origin: 'https://theshrine.pw' }
  const el = new ShrineSound()
  el.setAttribute('file', 'a.mp3')
  el.connectedCallback()
  let played = false
  el.play = () => { played = true }
  el.share = () => {}
  let prevented = false
  el.children[0].listeners.contextmenu({ preventDefault: () => { prevented = true } })
  assert.ok(prevented)
  assert.ok(!played)
})

function gesture () {
  globalThis.location = { origin: 'https://theshrine.pw' }
  const el = new ShrineSound()
  el.setAttribute('file', 'a.mp3')
  el.connectedCallback()
  const calls = { play: 0, share: 0 }
  el.play = () => { calls.play++ }
  el.share = () => { calls.share++ }
  const on = el.children[0].listeners
  const touch = (t, x = 0, y = 0) => ({ pointerType: 'touch', timeStamp: t, clientX: x, clientY: y })
  return { el, calls, on, touch }
}

test('a touch hold of 500ms or more shares once on pointerup and does not play', () => {
  const { el, calls, on, touch } = gesture()
  on.pointerdown(touch(0))
  on.pointerup(touch(600))
  el.listeners.click()
  assert.deepEqual(calls, { play: 0, share: 1 })
})

test('a short tap plays and does not share', () => {
  const { el, calls, on, touch } = gesture()
  on.pointerdown(touch(0))
  on.pointerup(touch(120))
  el.listeners.click()
  assert.deepEqual(calls, { play: 1, share: 0 })
})

test('moving more than 10px cancels the hold', () => {
  const { calls, on, touch } = gesture()
  on.pointerdown(touch(0))
  on.pointermove(touch(300, 11, 0))
  on.pointerup(touch(700, 11, 0))
  assert.equal(calls.share, 0)
})

test('contextmenu plus a hold in one gesture shares only once', () => {
  const { calls, on, touch } = gesture()
  on.pointerdown(touch(0))
  on.contextmenu({ preventDefault () {} })
  on.pointerup(touch(600))
  on.contextmenu({ preventDefault () {} })
  assert.equal(calls.share, 1)
})

test('every sound is one focusable named button; the knob is decorative', () => {
  const sound = new ShrineSound()
  sound.setAttribute('label', 'Gude Laune')
  sound.connectedCallback()

  const buttons = sound.children.filter((child) => child.type === 'button')
  assert.equal(buttons.length, 1)
  assert.equal(buttons[0].textContent, 'Gude Laune')
  assert.equal(buttons[0].attrs.tabindex, undefined)
  assert.equal(sound.attrs.tabindex, undefined)
  const knob = sound.children.find((child) => child.className === 'index__sound-knob')
  assert.equal(knob.attrs['aria-hidden'], 'true')
})
