import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cloudflare } from '@cloudflare/vite-plugin'
import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json' with { type: 'json' }

export default defineConfig({
  plugins: [
    react(),
    cloudflare(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['cooking-pot.png'],
      manifest: {
        name: 'KONYHA Recipe Manager',
        short_name: 'KONYHA',
        description: 'Create and manage your recipes with ease',
        start_url: '/',
        display: 'standalone',
        background_color: '#101010',
        theme_color: '#101010',
        icons: [
          { src: '/cooking-pot-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/cooking-pot-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/cooking-pot-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        // These must reach the network: the Worker serves them, and /auth/* sits behind Cloudflare Access.
        navigateFallbackDenylist: [/^\/api\//, /^\/auth\//, /^\/cdn-cgi\//],
        runtimeCaching: [
          {
            // Network first, so an edit is never hidden behind a cached response. The cache only helps offline.
            urlPattern: ({ url, request }) =>
              request.method === 'GET' &&
              ['/api/recipes', '/api/tags', '/api/config'].includes(url.pathname),
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', networkTimeoutSeconds: 5 },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
})
