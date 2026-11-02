import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { before, test } from 'node:test'
import assert from 'node:assert/strict'

const rootDir = join(import.meta.dirname, '..')
const outputDir = join(rootDir, '.output', 'public')
const read = (file) => readFileSync(join(outputDir, file), 'utf8')

before(() => {
  execFileSync(process.execPath, [join(rootDir, 'node_modules', 'nuxt', 'bin', 'nuxt.mjs'), 'generate'], {
    cwd: rootDir,
    stdio: 'ignore'
  })
})

test('generates / with every sound', () => {
  const html = read('index.html')
  const sounds = JSON.parse(read('sounds.json'))

  assert.ok(html.includes('All about gude Laune'))
  for (const { file } of sounds) {
    assert.ok(html.includes(`href="/sounds/${file}"`), `preload for ${file}`)
    assert.ok(existsSync(join(outputDir, 'sounds', file)), `asset ${file}`)
  }
})

test('generates the SPA fallback page', () => {
  assert.ok(existsSync(join(outputDir, '200.html')))
})

test('styles the headline in shrine red', () => {
  const inlineCss = read('index.html')
  const bundledCss = readdirSync(join(outputDir, '_nuxt'))
    .filter((file) => file.endsWith('.css'))
    .map((file) => read(join('_nuxt', file)))
    .join('')

  assert.match(inlineCss + bundledCss, /\.index__headline span\{[^}]*color:#f90101/)
})

test('ships a PWA that precaches sounds and fonts', () => {
  const manifest = JSON.parse(read('manifest.webmanifest'))
  const sw = read('sw.js')

  assert.equal(manifest.short_name, 'The Shrine')
  assert.equal(manifest.start_url, '/?standalone=true')
  for (const icon of manifest.icons) assert.ok(existsSync(join(outputDir, icon.src)), icon.src)
  assert.ok(sw.includes('sounds/30_laune1.mp3'))
  assert.ok(sw.includes('fonts/Keania_One/KeaniaOne-Regular.woff2'))
})
