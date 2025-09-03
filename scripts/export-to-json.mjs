#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const outputPath = path.join(process.cwd(), 'public', 'data', 'data.json')

async function main() {
  try {
    console.log('📊 Exporting database (Prisma) to JSON...')

    const recipeRows = await prisma.recipes.findMany({ orderBy: { created_at: 'desc' } })
    const recipes = recipeRows.map((row) => ({
      id: row.id,
      title: row.title,
      ingredients: JSON.parse(row.ingredients),
      instructions: JSON.parse(row.instructions),
      tags: JSON.parse(row.tags),
      metadata: {
        totalTime: row.total_time,
        yield: row.yield,
      },
      archived: Boolean(row.archived),
      createdAt: row.created_at,
      lastModified: row.last_modified,
    }))

    const tagRows = await prisma.tags.findMany({ orderBy: { display_name: 'asc' } })
    const tags = tagRows.map((row) => ({ id: row.id, displayName: row.display_name }))

    const configRows = await prisma.user_config.findMany()
    const userConfig = {}
    for (const row of configRows) userConfig[row.key] = row.value

    const finalConfig = {
      userId: userConfig.userId || 'user',
      theme: userConfig.theme || 'dark',
      language: userConfig.language || 'en',
    }

    const data = { recipes, tags, userConfig: finalConfig }

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath)
    await fs.mkdir(outputDir, { recursive: true })
    await fs.writeFile(outputPath, JSON.stringify(data, null, 2), 'utf8')

    console.log(`✅ Exported ${data.recipes.length} recipes and ${data.tags.length} tags to JSON`)
    console.log('📍 JSON file created at:', outputPath)
  } catch (error) {
    console.error('❌ Export failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
