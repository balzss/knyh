import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  distDir: 'build',
  output: process.env.NEXT_OUTPUT_MODE === 'export' ? 'export' : undefined,
  basePath: '/knyh',
  images: {
    unoptimized: true,
  },
}

export default nextConfig
