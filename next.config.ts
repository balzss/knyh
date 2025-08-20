import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import withSerwistInit from '@serwist/next'
import { readFileSync } from 'fs'
import { join } from 'path'

const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'))

const basePath = '/knyh'

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  cacheOnNavigation: true,
  reloadOnOnline: true,
})

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
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
}

const withNextIntl = createNextIntlPlugin()
export default withSerwist(withNextIntl(nextConfig))
