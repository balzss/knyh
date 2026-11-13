import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-plugin'

const alias = { '@': fileURLToPath(new URL('./src', import.meta.url)) }

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'node',
          globals: true,
          include: ['src/**/*.test.ts'],
        },
        resolve: { alias },
      },
      {
        plugins: [
          cloudflareTest(async () => ({
            wrangler: { configPath: './wrangler.jsonc' },
            miniflare: {
              bindings: {
                TEAM_DOMAIN: 'test.cloudflareaccess.com',
                POLICY_AUD: 'test-audience',
                // A local .dev.vars must never turn on the bypass inside tests
                DEV_AUTH_BYPASS: 'false',
                TEST_MIGRATIONS: await readD1Migrations('./migrations'),
              },
            },
          })),
        ],
        test: {
          name: 'worker',
          include: ['test/worker/**/*.test.ts'],
          setupFiles: ['./test/worker/setup.ts'],
        },
      },
    ],
  },
})
