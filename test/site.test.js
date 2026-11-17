import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseCatalog } from '../public/js/sounds.js'

const publicDir = join(import.meta.dirname, '..', 'public')
const read = (file) => readFileSync(join(publicDir, file), 'utf8')
const html = read('index.html')
const sounds = parseCatalog(JSON.parse(read('sounds.json')))
const grooves = parseCatalog(JSON.parse(read('grooves.json')))

test('index.html preloads every sound and each asset exists', () => {
  assert.match(html, /<html lang="de">/)
  for (const { file } of sounds) {
    assert.ok(html.includes(`href="/sounds/${file}"`), `preload for ${file}`)
    assert.ok(existsSync(join(publicDir, 'sounds', file)), `asset ${file}`)
  }
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
