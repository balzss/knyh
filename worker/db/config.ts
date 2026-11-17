import type { UserConfig } from '../../shared/types'

const CONFIG_KEYS = ['name', 'language'] as const

export async function getConfig(db: D1Database): Promise<UserConfig> {
  const { results } = await db
    .prepare('SELECT key, value FROM config')
    .all<{ key: string; value: string }>()
  const config: Record<string, string> = {}
  for (const row of results) config[row.key] = row.value

  return {
    name: config.name || 'KONYHA',
    language: config.language || 'en',
  }
}

export function configStatements(
  db: D1Database,
  updates: Partial<UserConfig>
): D1PreparedStatement[] {
  return CONFIG_KEYS.filter((key) => updates[key] !== undefined).map((key) =>
    db
      .prepare(
        'INSERT INTO config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
      )
      .bind(key, String(updates[key]))
  )
}

export async function updateConfig(
  db: D1Database,
  updates: Partial<UserConfig>
): Promise<UserConfig> {
  const statements = configStatements(db, updates)
  if (statements.length > 0) await db.batch(statements)
  return getConfig(db)
}
