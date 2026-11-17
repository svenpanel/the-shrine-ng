// @ts-check
// Pure catalog and media paths: no DOM access, importable from node:test.

/** @typedef {{ file: string, name: string }} CatalogEntry */

/**
 * Validates the parsed JSON of sounds.json / grooves.json.
 * @param {unknown} data
 * @returns {CatalogEntry[]}
 */
export function parseCatalog (data) {
  if (!Array.isArray(data)) throw new TypeError('catalog must be an array')
  return data.map((entry, index) => {
    if (typeof entry?.file !== 'string' || typeof entry?.name !== 'string') {
      throw new TypeError(`catalog entry ${index} needs string "file" and "name"`)
    }
    return { file: entry.file, name: entry.name }
  })
}

/**
 * Site-absolute URL path of a media file.
 * @param {'sounds' | 'grooves'} dir
 * @param {string} file
 */
export const mediaPath = (dir, file) => `/${dir}/${file}`

/**
 * @param {string} url
 * @returns {Promise<CatalogEntry[]>}
 */
export async function loadCatalog (url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${url}: ${response.status}`)
  return parseCatalog(await response.json())
}
