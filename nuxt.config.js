import pkg from './package'

const baseUrl = {
  production: 'https://theshrine.pw',
  development: 'http://0.0.0.0:3000'
}[process.env.NODE_ENV] || ''

export default {
  mode: 'universal',

  /*
  ** Headers of the page
  */
  head: {
    title: 'The Shrine: svenpanel 🔴 next generation ',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description },
      { hid: 'og:title', property: 'og:title', content: 'The Shrine next generation' },
      { hid: 'og:description', property: 'og:description', content: pkg.description },
      { hid: 'og:image', property: 'og:image', content: baseUrl + '/og_image.png' },
      { hid: 'og:type', property: 'og:type', content: 'website' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
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
  css: [
    '~/assets/global.scss'
  ],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    '@nuxtjs/pwa',
    '@nuxtjs/style-resources'
  ],

  styleResources: {
    sass: ['~/assets/variables.scss']
  },

  manifest: {
    'name': 'The Shrine: svenpanel next generation',
    'short_name': 'TheShrine NG',
    'icons': [{
      'src': '/android-chrome-192x192.png',
      'sizes': '192x192',
      'type': 'image/png'
    }, {
      'src': '/android-chrome-256x256.png',
      'sizes': '256x256',
      'type': 'image/png'
    }],
    'theme_color': '#ffffff',
    'background_color': '#000000',
    'display': 'standalone'
  },

  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
    }
  }
}
