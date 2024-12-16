const options = {"workboxURL":"https://cdn.jsdelivr.net/npm/workbox-cdn/workbox/workbox-sw.js","importScripts":[],"config":{"debug":false},"cacheOptions":{"cacheId":"the-shrine-ng-prod","directoryIndex":"/","revision":"xz9igqJbbStR"},"clientsClaim":true,"skipWaiting":true,"cleanupOutdatedCaches":true,"offlineAnalytics":false,"preCaching":[{"revision":"xz9igqJbbStR","url":"/?standalone=true"},{"revision":"m4qyyq5s.529","url":"/sounds/30_laune1.mp3"},{"revision":"m4qyyq5s.529","url":"/sounds/34_laune2.mp3"},{"revision":"m4qyyq5w.529","url":"/sounds/50_laune3.mp3"},{"revision":"m4qyyq5s.529","url":"/sounds/36_laune4.mp3"},{"revision":"m4qyyq5s.529","url":"/sounds/35_laune5.mp3"},{"revision":"m4qyyq5s.529","url":"/sounds/37_laune6.mp3"},{"revision":"m4qyyq5s.529","url":"/sounds/38_laune7.mp3"},{"revision":"m4qyyq5s.529","url":"/sounds/39_laune8.mp3"},{"revision":"m4qyyq5s.529","url":"/sounds/40_laune9.mp3"},{"revision":"m4qyyq5w.529","url":"/sounds/feier_bis_ich_kotze.mp3"},{"revision":"m4qyyq5w.529","url":"/sounds/supergeil.mp3"},{"revision":"m4qyyq5w.529","url":"/sounds/love_is_in_the_air.mp3"},{"revision":"m4qyyq5w.529","url":"/sounds/einfach_einfach_und_einfach.mp3"},{"revision":"m4qyyq5w.529","url":"/sounds/super_3x.mp3"},{"revision":"m4qyyq5w.529","url":"/sounds/what_a_weather_wow.mp3"},{"revision":"m4qyyq5s.529","url":"/sounds/31_laune10.mp3"},{"revision":"m4qyyq5s.529","url":"/sounds/41_laune11.mp3"},{"revision":"m4qyyq5s.529","url":"/sounds/32_laune12.mp3"},{"revision":"m4qyyq5s.529","url":"/sounds/33_laune13.mp3"},{"revision":"m4qyyq5w.529","url":"/sounds/47_laune14.mp3"},{"revision":"m4qyyq5w.529","url":"/sounds/43_laune15.mp3"},{"revision":"m4qyyq5w.529","url":"/sounds/44_laune16.mp3"},{"revision":"m4qyyq5w.529","url":"/sounds/45_laune17.mp3"},{"revision":"m4qyyq5w.529","url":"/sounds/46_laune18.mp3"},{"revision":"m4qyyq5w.529","url":"/sounds/42_laune19.mp3"},{"revision":"m4qyyq5w.529","url":"/sounds/48_laune20.mp3"},{"revision":"m4qyyq5w.529","url":"/sounds/51_laune21.mp3"},{"revision":"m4qyyq5w.529","url":"/sounds/49_laune22.mp3"},{"revision":"m4qyyq5s.529","url":"/sounds/12_laune23.mp3"},{"revision":"m4qyyq5s.529","url":"/sounds/11_laune24.mp3"},{"revision":"m4qyyq5s.529","url":"/sounds/28_laune25.mp3"},{"revision":"m4qyyq5s.529","url":"/sounds/29_laune26.mp3"},{"revision":"m4qyyq5s.529","url":"/sounds/27_laune27.mp3"},{"revision":"m4qyyq5w.529","url":"/sounds/53_laune28.mp3"},{"revision":"m4qyyq5w.529","url":"/sounds/58_laune29.mp3"},{"revision":"m4qyyq5w.529","url":"/sounds/52_laune30.mp3"},{"revision":"m4qyyq5w.529","url":"/sounds/56_laune31.mp3"},{"revision":"m4qyyq5w.529","url":"/sounds/57_laune32.mp3"},{"revision":"m4qyyq5w.529","url":"/sounds/55_laune33.mp3"},{"revision":"m4qyyq5w.529","url":"/sounds/54_laune34.mp3"},{"revision":"m4qyyq5s.529","url":"/sounds/13_together.mp3"},{"revision":"m4qyyq5s.529","url":"/sounds/14_1234.mp3"},{"revision":"m4qyyq5s.529","url":"/sounds/15_fuckme.mp3"},{"revision":"m4qyyq5s.529","url":"/sounds/16_crazy.mp3"},{"revision":"m4qyyq5s.529","url":"/sounds/17_10000.mp3"},{"revision":"m4qyyq5s.529","url":"/sounds/18_bwiu.mp3"},{"revision":"m4qyyq5s.529","url":"/sounds/19_athmo.mp3"},{"revision":"m4qyyq5s.529","url":"/sounds/20_gocrazy.mp3"},{"revision":"m4qyyq5s.529","url":"/sounds/21_wasnlos.mp3"},{"revision":"m4qyyq5s.529","url":"/sounds/22_wobinich.mp3"},{"revision":"m4qyyq5s.529","url":"/sounds/23_redalert.mp3"},{"revision":"m4qyyq5s.529","url":"/sounds/24_ichverab.mp3"},{"revision":"m4qyyq5s.529","url":"/sounds/25_feelinfree.mp3"},{"revision":"m4qyyq5s.529","url":"/sounds/26_wirfeiern.mp3"},{"revision":"m4qyyq5w.529","url":"/sounds/continue_the_mission.mp3"},{"revision":"m4qyyq5w.529","url":"/sounds/party_with_us_us_us.mp3"},{"revision":"1","url":"/fonts/Keania_One/KeaniaOne-Regular.woff2"},{"revision":"1","url":"/fonts/Keania_One/KeaniaOne-Regular.ttf"}],"runtimeCaching":[{"urlPattern":"/_nuxt/","handler":"CacheFirst","method":"GET","strategyPlugins":[]},{"urlPattern":"/","handler":"NetworkFirst","method":"GET","strategyPlugins":[]}],"offlinePage":null,"pagesURLPattern":"/","offlineStrategy":"NetworkFirst"}

importScripts(...[options.workboxURL, ...options.importScripts])

initWorkbox(workbox, options)
workboxExtensions(workbox, options)
precacheAssets(workbox, options)
cachingExtensions(workbox, options)
runtimeCaching(workbox, options)
offlinePage(workbox, options)
routingExtensions(workbox, options)

function getProp(obj, prop) {
  return prop.split('.').reduce((p, c) => p[c], obj)
}

function initWorkbox(workbox, options) {
  if (options.config) {
    // Set workbox config
    workbox.setConfig(options.config)
  }

  if (options.cacheNames) {
    // Set workbox cache names
    workbox.core.setCacheNameDetails(options.cacheNames)
  }

  if (options.clientsClaim) {
    // Start controlling any existing clients as soon as it activates
    workbox.core.clientsClaim()
  }

  if (options.skipWaiting) {
    workbox.core.skipWaiting()
  }

  if (options.cleanupOutdatedCaches) {
    workbox.precaching.cleanupOutdatedCaches()
  }

  if (options.offlineAnalytics) {
    // Enable offline Google Analytics tracking
    workbox.googleAnalytics.initialize()
  }
}

function precacheAssets(workbox, options) {
  if (options.preCaching.length) {
    workbox.precaching.precacheAndRoute(options.preCaching, options.cacheOptions)
  }
}


function runtimeCaching(workbox, options) {
  const requestInterceptor = {
    requestWillFetch({ request }) {
      if (request.cache === 'only-if-cached' && request.mode === 'no-cors') {
        return new Request(request.url, { ...request, cache: 'default', mode: 'no-cors' })
      }
      return request
    },
    fetchDidFail(ctx) {
      ctx.error.message =
        '[workbox] Network request for ' + ctx.request.url + ' threw an error: ' + ctx.error.message
      console.error(ctx.error, 'Details:', ctx)
    },
    handlerDidError(ctx) {
      ctx.error.message =
        `[workbox] Network handler threw an error: ` + ctx.error.message
      console.error(ctx.error, 'Details:', ctx)
      return null
    }
  }

  for (const entry of options.runtimeCaching) {
    const urlPattern = new RegExp(entry.urlPattern)
    const method = entry.method || 'GET'

    const plugins = (entry.strategyPlugins || [])
      .map(p => new (getProp(workbox, p.use))(...p.config))

    plugins.unshift(requestInterceptor)

    const strategyOptions = { ...entry.strategyOptions, plugins }

    const strategy = new workbox.strategies[entry.handler](strategyOptions)

    workbox.routing.registerRoute(urlPattern, strategy, method)
  }
}

function offlinePage(workbox, options) {
  if (options.offlinePage) {
    // Register router handler for offlinePage
    workbox.routing.registerRoute(new RegExp(options.pagesURLPattern), ({ request, event }) => {
      const strategy = new workbox.strategies[options.offlineStrategy]
      return strategy
        .handle({ request, event })
        .catch(() => caches.match(options.offlinePage))
    })
  }
}

function workboxExtensions(workbox, options) {
  
}

function cachingExtensions(workbox, options) {
  
}

function routingExtensions(workbox, options) {
  
}
