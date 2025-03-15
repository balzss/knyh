import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KONYHA Recipe Manager',
    short_name: 'KONYHA',
    description: 'Create and manage your recipes with ease',
    start_url: '/knyh',
    display: 'standalone',
    background_color: '#101010',
    theme_color: '#101010',
    icons: [
      {
        src: '/knyh/cooking-pot-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
  }
}
