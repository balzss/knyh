import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KONYHA Recipe Manager',
    short_name: 'KONYHA',
    description: 'Create and manage your recipes with ease',
    start_url: '/knyh',
    scope: '/knyh',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/recipe-book.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/recipe-book.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
