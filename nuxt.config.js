import fs from 'fs'
import pkg from './package.json'

const baseUrl =
  {
    production: 'https://theshrine.pw',
    development: 'http://0.0.0.0:3000'
  }[process.env.NODE_ENV] || ''

const preCaching = require('./static/sounds.json').map(({ file }) => {
  const revision = fs.statSync(`./static/sounds/${file}`).mtimeMs.toString(36)

  return { url: `/sounds/${file}`, revision }
})

preCaching.concat(require('./static/grooves.json').map(({ file }) => {
  const revision = fs.statSync(`./static/grooves/${file}`).mtimeMs.toString(36)

  return { url: `/sounds/${file}`, revision }
}))

preCaching.push({ url: '/fonts/Keania_One/KeaniaOne-Regular.woff2', revision: "1" })
preCaching.push({ url: '/fonts/Keania_One/KeaniaOne-Regular.ttf', revision: "1" })

export default {
  head: {
    title: 'The Shrine: svenpanel 🔴 next generation ',
    meta: [
      { charset: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, minimal-ui'
      },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black' },
      { hid: 'description', name: 'description', content: pkg.description },
      { hid: 'og:title', property: 'og:title', content: 'The Shrine next generation' },
      { hid: 'og:description', property: 'og:description', content: pkg.description },
      { hid: 'og:image', property: 'og:image', content: baseUrl + '/og_image.png' },
      { hid: 'og:type', property: 'og:type', content: 'website' }
    ],
    link: [
      {
        rel: 'preload',
        href: '/fonts/Keania_One/KeaniaOne-Regular.woff2',
        as: 'font',
        type: 'font/woff2',
        crossorigin: 'anonymous'
      },
      {
        rel: 'preload',
        href: '/fonts/Keania_One/KeaniaOne-Regular.ttf',
        as: 'font',
        type: 'font/ttf',
        crossorigin: 'anonymous'
      }
    ]
  },

  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#f90101' },

  /*
   ** Global CSS
   */
  css: ['~/assets/global.scss'],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [],

  /*
   ** Nuxt.js modules
   */
  modules: ['@nuxtjs/pwa', '@nuxtjs/style-resources'],

  styleResources: {
    sass: ['~/assets/variables.scss']
  },

  /*
   ** Build configuration
   */
  target: 'static',
  build: {
    /*
     ** You can extend webpack config here
     */
    extend (config, ctx) {}
  },

  pwa: {
    workbox: {
      workboxURL: 'https://cdn.jsdelivr.net/npm/workbox-cdn/workbox/workbox-sw.js',
      autoRegister: true,
      preCaching
    },
    manifest: {
      name: 'The Shrine: svenpanel next generation',
      short_name: 'The Shrine',
      theme_color: '#777',
      background_color: '#000000',
      display: 'standalone',
      lang: 'de'
    }
  }
}
