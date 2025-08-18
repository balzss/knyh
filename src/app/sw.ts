/// <reference lib="webworker" />
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { Serwist, NetworkFirst, StaleWhileRevalidate, CacheFirst } from 'serwist'

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[]
  }
}

declare const self: ServiceWorkerGlobalScope

// The serwist instance automatically registers itself when created
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Cache API routes for offline functionality
    {
      matcher: ({ url }) => url.pathname.startsWith('/api/'),
      handler: new NetworkFirst({
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
      }),
    },
    // Cache static data files
    {
      matcher: ({ url }) => url.pathname.includes('/data/') && url.pathname.endsWith('.json'),
      handler: new StaleWhileRevalidate({
        cacheName: 'data-cache',
      }),
    },
    // Cache images
    {
      matcher: ({ request }) => request.destination === 'image',
      handler: new CacheFirst({
        cacheName: 'images-cache',
      }),
    },
    // Cache fonts
    {
      matcher: ({ url }) => /\.(?:woff|woff2|eot|ttf|otf)$/.test(url.pathname),
      handler: new CacheFirst({
        cacheName: 'fonts-cache',
      }),
    },
  ],
})

// Listen for messages from the client to skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
