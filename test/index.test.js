const { resolve } = require('path')
const test = require('ava')
const { Nuxt, Builder } = require('nuxt')

// Init Nuxt.js and start listening on localhost:4000
test.before('Init Nuxt.js', async (t) => {
  const rootDir = resolve(__dirname, '..')
  let config = {}
  try { config = require(resolve(rootDir, 'nuxt.config.js')) } catch (e) {}
  config.rootDir = rootDir // project folder
  config.dev = false // production build
  const nuxt = new Nuxt(config)
  t.context.nuxt = nuxt // We keep a reference to Nuxt so we can close the server at the end of the test
  await new Builder(nuxt).build()
  nuxt.listen(4000, 'localhost')
})

test('Route / exists and renders HTML', async (t) => {
  const { nuxt } = t.context
  const context = {}
  const { html } = await nuxt.renderRoute('/', context)
  t.true(html.includes('All about gude Laune'))
})

test('Route / exists and renders HTML with CSS applied', async (t) => {
  const { nuxt } = t.context
  const window = await nuxt.renderAndGetWindow('http://localhost:4000/')
  const element = window.document.querySelector('.index__headline > span ')
  t.not(element, null)
  t.is(window.getComputedStyle(element).color, 'rgb(249, 1, 1)')
})

// Close server and ask nuxt to stop listening to file changes
test.after('Closing server', (t) => {
  const { nuxt } = t.context
  nuxt.close()
})
