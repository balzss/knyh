import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { z } from 'zod'
import { serverDataPath, DEFAULT_TIMESTAMP } from '@/lib/utils'
import type { DatabaseSchema } from '@/lib/types'

const dataFilePath = path.join(process.cwd(), serverDataPath)

const recipeSchema = z.object({
  id: z.string(),
  title: z.string(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  tags: z.array(z.string()),
  metadata: z.object({ totalTime: z.string(), yield: z.string() }),
  archived: z.boolean().optional(),
  createdAt: z.string().optional(),
  lastModified: z.string().optional(),
})

const tagSchema = z.object({ id: z.string(), displayName: z.string() })

const userConfigSchema = z.object({
  userId: z.string(),
  theme: z.enum(['light', 'dark']),
  language: z.string(),
})

const databaseSchema = z.object({
  recipes: z.array(recipeSchema),
  tags: z.array(tagSchema),
  userConfig: userConfigSchema,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = databaseSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid data format', issues: parsed.error.issues },
        { status: 400 }
      )
    }

    const data: DatabaseSchema = {
      ...parsed.data,
      recipes: parsed.data.recipes.map((r) => ({
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

    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf8')
    return NextResponse.json({ message: 'Import successful' }, { status: 200 })
  } catch (error) {
    console.error('Import failed', error)
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
