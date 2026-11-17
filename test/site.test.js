import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mediaPath, parseCatalog } from '../public/js/sounds.js'

const publicDir = join(import.meta.dirname, '..', 'public')
const read = (file) => readFileSync(join(publicDir, file), 'utf8')
const html = read('index.html')
const sounds = parseCatalog(JSON.parse(read('sounds.json')))
const grooves = parseCatalog(JSON.parse(read('grooves.json')))

test('index.html names no sound; the catalogs drive the page and every asset exists', () => {
  assert.match(html, /<html lang="de">/)
  assert.ok(!html.includes('.mp3'), 'index.html must not list media files')
  assert.match(html, /<link rel="preload" href="\/sounds\.json" as="fetch" crossorigin>/)
  assert.match(html, /<link rel="preload" href="\/grooves\.json" as="fetch" crossorigin>/)
  for (const { file } of sounds) assert.ok(existsSync(join(publicDir, 'sounds', file)), `asset ${file}`)
  for (const { file } of grooves) assert.ok(existsSync(join(publicDir, 'grooves', file)), `groove ${file}`)
})

test('every mp3 on disk is listed in its catalog', () => {
  for (const [dir, catalog] of [['sounds', sounds], ['grooves', grooves]]) {
    const listed = new Set(catalog.map(({ file }) => file))
    for (const file of readdirSync(join(publicDir, dir)).filter((f) => f.endsWith('.mp3'))) {
      assert.ok(listed.has(file), `${dir}/${file} missing from ${dir}.json`)
    }
  }
})

test('links iOS splash screens that exist', () => {
  const splashes = [...html.matchAll(/<link href="([^"]+)" rel="apple-touch-startup-image"/g)].map(([, href]) => href)

  assert.ok(splashes.length > 0)
  for (const href of splashes) assert.ok(existsSync(join(publicDir, href)), href)
})

test('index.html references existing stylesheet, entry module, icons and manifest', () => {
  for (const pattern of [
    /<link rel="stylesheet" href="([^"]+)"/,
    /<script type="module" src="([^"]+)"/,
    /<link rel="icon" href="([^"]+)"/,
    /<link rel="apple-touch-icon" href="([^"]+)"/,
    /<link rel="manifest" href="([^"]+)"/
  ]) {
    const href = html.match(pattern)?.[1]
    assert.ok(href, String(pattern))
    assert.ok(existsSync(join(publicDir, href)), href)
  }
})

test('manifest is installable and its icons exist', () => {
  const manifest = JSON.parse(read('manifest.webmanifest'))

  assert.equal(manifest.short_name, 'The Shrine')
  assert.equal(manifest.start_url, '/?standalone=true')
  assert.equal(manifest.id, '/?standalone=true')
  assert.deepEqual(manifest.display_override, ['standalone'])
  for (const icon of manifest.icons) assert.ok(existsSync(join(publicDir, icon.src)), icon.src)
})

test('mediaPath builds a site-absolute media path', () => {
  assert.equal(mediaPath('sounds', 'a.mp3'), '/sounds/a.mp3')
  assert.equal(mediaPath('grooves', 'b.mp3'), '/grooves/b.mp3')
})

test('parseCatalog validates entries', () => {
  assert.deepEqual(parseCatalog([{ file: 'a.mp3', name: 'A', extra: 1 }]), [{ file: 'a.mp3', name: 'A' }])
  assert.throws(() => parseCatalog({}), TypeError)
  assert.throws(() => parseCatalog([{ file: 'a.mp3' }]), TypeError)
})

test('styles the headline in shrine red', () => {
  const css = read('style.css')

  assert.match(css, /--color-red: hsl\(360 99% 49%\)/)
  assert.match(css, /\.index__headline span,[^{]*\{[^}]*color: var\(--color-red\)/)
})

test('viewport covers the safe areas and stays unscalable', () => {
  const viewport = html.match(/<meta name="viewport" content="([^"]+)"/)?.[1]
  assert.ok(viewport?.includes('viewport-fit=cover'))
  assert.ok(viewport.includes('user-scalable=0'))
})

test('keeps the headline, catalogs and groove wiring unchanged', () => {
  assert.match(html, /<h1 class="index__headline">\s*<span>\s*The Shrine\s*<sub>next generation<\/sub>\s*<\/span>\s*<\/h1>/)
  assert.match(html, /<h2>„1, 2, 3 – gude Laune!“<\/h2>/)
  assert.match(html, /<shrine-groove class="groove-player index__groove-player" id="groove-player">/)
  const app = read('js/app.js')
  assert.match(app, /loadCatalog\('\/sounds\.json'\)/)
  assert.match(app, /loadCatalog\('\/grooves\.json'\)/)
})

test('style.css keeps to the palette tokens and adds the touch and focus polish', () => {
  const css = read('style.css')
  const components = css.slice(css.indexOf('@layer components'))

  assert.ok(!/#[0-9a-f]{3,8}\b/i.test(components.replace(/color: #(ccc|eee);/g, '')), 'hex colors in components')
  assert.match(css, /color-scheme: dark/)
  assert.match(css, /:focus-visible/)
  assert.match(css, /touch-action: manipulation/)
})

test('sound labels break only at spaces, never inside a word', () => {
  const css = read('style.css')
  const rule = css.match(/^ {2}\.index__sound-name \{([^}]*)\}/m)?.[1] ?? ''

  assert.match(rule, /hyphens: manual/)
  assert.match(rule, /overflow-wrap: normal/)
  assert.doesNotMatch(css, /hyphens: auto|word-break: (break-all|break-word)/)
})
