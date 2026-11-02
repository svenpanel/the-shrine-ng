import pkg from './package.json' with { type: 'json' }

const baseUrl =
  {
    production: 'https://theshrine.pw',
    development: 'http://0.0.0.0:3000'
  }[process.env.NODE_ENV] || ''

const appName = 'The Shrine: svenpanel next generation'
const themeColor = '#777'

export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',

  app: {
    head: {
      title: 'The Shrine: svenpanel 🔴 next generation ',
      htmlAttrs: { lang: 'de' },
      meta: [
        { charset: 'utf-8' },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, minimal-ui'
        },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black' },
        { name: 'apple-mobile-web-app-title', content: appName },
        { name: 'description', content: pkg.description },
        { property: 'og:site_name', content: appName },
        { property: 'og:title', content: 'The Shrine next generation' },
        { property: 'og:description', content: pkg.description },
        { property: 'og:image', content: baseUrl + '/og_image.png' },
        { property: 'og:type', content: 'website' }
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
      ],
      script: [
        {
          'data-goatcounter': 'https://theshrine.goatcounter.com/count',
          async: true,
          src: '//gc.zgo.at/count.js',
          tagPosition: 'bodyClose'
        }
      ]
    }
  },

  experimental: {
    // single static page: inline the payload and skip the client app manifest
    payloadExtraction: false,
    appManifest: false
  },

  css: ['normalize.css', '~/assets/global.scss'],

  modules: ['@vite-pwa/nuxt'],

  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'marquee'
    }
  },

  pwa: {
    registerType: 'autoUpdate',
    pwaAssets: {
      config: false,
      preset: 'minimal-2023',
      image: 'public/icon.png'
    },
    manifest: {
      name: appName,
      short_name: 'The Shrine',
      description: pkg.description,
      start_url: '/?standalone=true',
      theme_color: themeColor,
      background_color: '#000000',
      display: 'standalone',
      lang: 'de'
    },
    workbox: {
      cacheId: 'the-shrine-ng-prod',
      navigateFallback: '/',
      globPatterns: [
        '**/*.{js,css,html}',
        'sounds/*.mp3',
        'fonts/Keania_One/*.{woff2,ttf}'
      ],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true
    }
  }
})
