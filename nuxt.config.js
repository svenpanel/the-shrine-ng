import { createAppleSplashScreens } from '@vite-pwa/assets-generator/config'
import pkg from './package.json' with { type: 'json' }

const baseUrl =
  {
    production: 'https://theshrine.pw',
    development: 'http://0.0.0.0:3000'
  }[process.env.NODE_ENV] || ''

const appName = 'The Shrine: svenpanel next generation'
const themeColor = '#777'
const backgroundColor = '#000000'
const fullBleed = { padding: 0, resizeOptions: { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } } }

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
      preset: {
        transparent: { sizes: [64, 192, 512], favicons: [[48, 'favicon.ico']], ...fullBleed },
        maskable: { sizes: [512], resizeOptions: { background: backgroundColor } },
        apple: { sizes: [180], ...fullBleed },
        appleSplashScreens: createAppleSplashScreens(
          {
            resizeOptions: { background: backgroundColor },
            linkMediaOptions: { log: false },
            // the default name adds "light-" to the links but not to the files
            name: (landscape, { width, height }, dark) =>
              `apple-splash-${landscape ? 'landscape' : 'portrait'}-${dark ? 'dark-' : ''}${width}x${height}.png`
          },
          [
            'iPhone SE 4"', 'iPhone 8', 'iPhone 8 Plus', 'iPhone X', 'iPhone XR', 'iPhone XS Max',
            'iPhone 14', 'iPhone 15 Pro', 'iPhone 15 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Pro Max',
            'iPad 9.7"', 'iPad Pro 10.5"', 'iPad Pro 11"', 'iPad Pro 12.9"'
          ]
        )
      },
      image: 'public/icon.png'
    },
    manifest: {
      name: appName,
      short_name: 'The Shrine',
      description: pkg.description,
      id: '/?standalone=true',
      start_url: '/?standalone=true',
      theme_color: themeColor,
      background_color: backgroundColor,
      display: 'standalone',
      lang: 'de'
    },
    workbox: {
      cacheId: 'the-shrine-ng-prod',
      navigateFallback: '/',
      globPatterns: [
        '**/*.{js,css,html}',
        'sounds/*.mp3',
        'grooves/*.mp3',
        'fonts/Keania_One/*.{woff2,ttf}'
      ],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true
    }
  }
})
