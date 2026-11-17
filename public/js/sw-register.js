// @ts-check

/** Registers the offline service worker and reloads once when an update takes over. */
export function registerServiceWorker () {
  if (!('serviceWorker' in navigator)) return

  const hadController = Boolean(navigator.serviceWorker.controller)
  let reloading = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return
    reloading = true
    location.reload()
  })
  navigator.serviceWorker.register('/sw.js').catch((error) => console.warn('service worker', error))
}
