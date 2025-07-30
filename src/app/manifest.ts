import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  return {
    name: 'KONYHA Recipe Manager',
    short_name: 'KONYHA',
    description: 'Create and manage your recipes with ease',
    start_url: basePath || '/',
    display: 'standalone',
    background_color: '#101010',
    theme_color: '#101010',
    icons: [
      {
        src: `${basePath}/cooking-pot-192.png`,
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: `${basePath}/cooking-pot-512.png`,
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: `${basePath}/cooking-pot-512-maskable.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
