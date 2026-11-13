import { env } from 'cloudflare:workers'
import { applyD1Migrations } from 'cloudflare:test'
import type { D1Migration } from '@cloudflare/vitest-plugin'

const testEnv = env as unknown as { DB: D1Database; TEST_MIGRATIONS: D1Migration[] }

await applyD1Migrations(testEnv.DB, testEnv.TEST_MIGRATIONS)
