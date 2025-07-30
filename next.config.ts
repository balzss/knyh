import type { NextConfig } from 'next'

const basePath = '/knyh'

const nextConfig: NextConfig = {
  distDir: 'build',
  output: process.env.NEXT_OUTPUT_MODE === 'export' ? 'export' : undefined,
  basePath,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
}

export default nextConfig
