import { NextResponse } from 'next/server'
import { importFromJson } from '@/lib/database'
import { DEFAULT_TIMESTAMP } from '@/lib/utils'
import type { DatabaseSchema, Recipe, Tag, UserConfig, GroupData } from '@/lib/types'

export const dynamic = 'force-static'

function isValidGroupData(obj: unknown): obj is GroupData {
  if (typeof obj !== 'object' || obj === null) return false
  const record = obj as Record<string, unknown>
  return (
    'label' in record &&
    typeof record.label === 'string' &&
    'items' in record &&
    Array.isArray(record.items) &&
    record.items.every((item: unknown) => typeof item === 'string')
  )
}

function isValidRecipe(obj: unknown): obj is Recipe {
  if (typeof obj !== 'object' || obj === null) return false
  const record = obj as Record<string, unknown>
  return (
    'id' in record &&
    typeof record.id === 'string' &&
    'title' in record &&
    typeof record.title === 'string' &&
    'ingredients' in record &&
    Array.isArray(record.ingredients) &&
    record.ingredients.every(isValidGroupData) &&
    'instructions' in record &&
    Array.isArray(record.instructions) &&
    record.instructions.every((inst: unknown) => typeof inst === 'string') &&
    'tags' in record &&
    Array.isArray(record.tags) &&
    record.tags.every((tag: unknown) => typeof tag === 'string') &&
    'metadata' in record &&
    typeof record.metadata === 'object' &&
    record.metadata !== null &&
    'totalTime' in (record.metadata as Record<string, unknown>) &&
    typeof (record.metadata as Record<string, unknown>).totalTime === 'string' &&
    'yield' in (record.metadata as Record<string, unknown>) &&
    typeof (record.metadata as Record<string, unknown>).yield === 'string' &&
    (!('archived' in record) || typeof record.archived === 'boolean') &&
    (!('createdAt' in record) || typeof record.createdAt === 'string') &&
    (!('lastModified' in record) || typeof record.lastModified === 'string')
  )
}

function isValidTag(obj: unknown): obj is Tag {
  if (typeof obj !== 'object' || obj === null) return false
  const record = obj as Record<string, unknown>
  return (
    'id' in record &&
    typeof record.id === 'string' &&
    'displayName' in record &&
    typeof record.displayName === 'string'
  )
}

function isValidUserConfig(obj: unknown): obj is UserConfig {
  if (typeof obj !== 'object' || obj === null) return false
  const record = obj as Record<string, unknown>
  return (
    'userId' in record &&
    typeof record.userId === 'string' &&
    'theme' in record &&
    (record.theme === 'light' || record.theme === 'dark') &&
    'language' in record &&
    typeof record.language === 'string'
  )
}

function isValidDatabaseSchema(obj: unknown): obj is DatabaseSchema {
  if (typeof obj !== 'object' || obj === null) return false
  const record = obj as Record<string, unknown>
  return (
    'recipes' in record &&
    Array.isArray(record.recipes) &&
    record.recipes.every(isValidRecipe) &&
    'tags' in record &&
    Array.isArray(record.tags) &&
    record.tags.every(isValidTag) &&
    'userConfig' in record &&
    isValidUserConfig(record.userConfig)
  )
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!isValidDatabaseSchema(body)) {
      return NextResponse.json({ message: 'Invalid data format' }, { status: 400 })
    }

    const data: DatabaseSchema = {
      ...body,
      recipes: body.recipes.map((r: Recipe) => ({
        ...r,
        createdAt: r.createdAt ?? DEFAULT_TIMESTAMP,
        lastModified: r.lastModified ?? DEFAULT_TIMESTAMP,
      })),
    }

    // Uniqueness checks
    const recipeIds = new Set<string>()
    for (const r of data.recipes) {
      if (recipeIds.has(r.id)) {
        return NextResponse.json(
          { message: `Duplicate recipe id detected: ${r.id}` },
          { status: 400 }
        )
      }
      recipeIds.add(r.id)
    }
    const tagIds = new Set<string>()
    for (const t of data.tags) {
      if (tagIds.has(t.id)) {
        return NextResponse.json({ message: `Duplicate tag id detected: ${t.id}` }, { status: 400 })
      }
      tagIds.add(t.id)
    }

    // Import into SQLite database
    importFromJson(data)

    return NextResponse.json({ message: 'Import successful' }, { status: 200 })
  } catch (error) {
    console.error('Import failed', error)
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
