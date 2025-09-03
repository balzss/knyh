#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const jsonPath = path.join(process.cwd(), 'public', 'data', 'data.json')

async function main() {
  try {
    // Read JSON
    const exists = await fs
      .stat(jsonPath)
      .then(() => true)
      .catch(() => false)
    if (!exists) {
      console.error('❌ JSON data file not found at:', jsonPath)
      process.exit(1)
    }

    console.log('📖 Reading JSON data...')
    const jsonData = JSON.parse(await fs.readFile(jsonPath, 'utf-8'))

    console.log(`📊 Found ${jsonData.recipes.length} recipes and ${jsonData.tags.length} tags`)

    console.log('🔄 Importing to database (Prisma)...')

    // Transactionally replace data
    await prisma.$transaction(async (tx) => {
      await tx.recipes.deleteMany({})
      await tx.tags.deleteMany({})
      await tx.user_config.deleteMany({})

      for (const recipe of jsonData.recipes) {
        let ingredients = recipe.ingredients
        if (
          Array.isArray(ingredients) &&
          ingredients.length > 0 &&
          typeof ingredients[0] === 'string'
        ) {
          ingredients = [{ label: '', items: ingredients }]
          console.log(`🔄 Converting ingredients format for recipe: ${recipe.title}`)
        }

        await tx.recipes.create({
          data: {
            id: recipe.id,
            title: recipe.title,
            ingredients: JSON.stringify(ingredients),
            instructions: JSON.stringify(recipe.instructions),
            tags: JSON.stringify(recipe.tags),
            total_time: recipe.metadata.totalTime,
            yield: recipe.metadata.yield,
            archived: recipe.archived ? 1 : 0,
            created_at: recipe.createdAt,
            last_modified: recipe.lastModified,
          },
        })
      }

      for (const tag of jsonData.tags) {
        await tx.tags.create({ data: { id: tag.id, display_name: tag.displayName } })
      }

      for (const [key, value] of Object.entries(jsonData.userConfig)) {
        await tx.user_config.create({ data: { key, value } })
      }
    })

    console.log('✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
