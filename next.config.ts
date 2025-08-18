import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

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
    NEXT_OUTPUT_MODE: process.env.NEXT_OUTPUT_MODE,
  },
}

const withNextIntl = createNextIntlPlugin()
export default withNextIntl(nextConfig)
