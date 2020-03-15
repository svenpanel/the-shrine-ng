const { resolve } = require('path')
const { Nuxt, Builder } = require('nuxt')
const { JSDOM } = require('jsdom')
const test = require('ava')

// We keep the nuxt and server instance
// So we can close them at the end of the test
let nuxt = null

// Init Nuxt.js and create a server listening on localhost:4000
test.before(async () => {
  const config = {
    dev: false,
    rootDir: resolve(__dirname, '..')
  }
  nuxt = new Nuxt(config)
  await new Builder(nuxt).build()
  await nuxt.server.listen(4000, 'localhost')
}, 30000)

test('Route / exists and renders HTML', async (t) => {
  const context = {}
  const { html } = await nuxt.server.renderRoute('/', context)
  t.true(html.includes('All about gude Laune'))
})

test('Route / exists and renders HTML with CSS applied', async (t) => {
  const context = {}
  const { html } = await nuxt.server.renderRoute('/', context)
  const { window } = new JSDOM(html).window
  const element = window.document.querySelector('.index__headline > span ')
  t.not(element, null)
  t.is(window.getComputedStyle(element).color, 'rgb(249, 1, 1)')
})

// Close server and ask nuxt to stop listening to file changes
test.after('Closing server and nuxt.js', (t) => {
  nuxt.close()
})
