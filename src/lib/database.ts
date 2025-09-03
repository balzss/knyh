import prisma from '@/lib/prisma'
import type { Recipe, Tag, UserConfig, DatabaseSchema, GroupData, ShoppingListItem } from './types'

export async function createRecipe(recipe: Omit<Recipe, 'id'>): Promise<Omit<Recipe, 'tags'>> {
  const id = generateId()
  const now = new Date()

  const { userId, title, ingredients, instructions, totalTime, archived } = recipe

  const result = await prisma.recipe.create({
    data: {
      id,
      userId,
      title,
      ingredients,
      instructions,
      totalTime,
      yield: recipe.yield,
      archived,
      createdAt: now,
      updatedAt: now,
      tags: {
        connect: recipe.tags.map(({ id }) => ({
          id,
        })),
      },
    },
  })

  return {
    ...result,
    ingredients: result.ingredients as GroupData[],
    instructions: result.instructions as string[],
  }
}

export async function createMultipleRecipes(recipes: Omit<Recipe, 'id'>[]): Promise<Recipe[]> {
  if (recipes.length === 0) {
    return []
  }

  const now = new Date()
  const createdRecipes: Recipe[] = []

  // Use transaction for better performance and data integrity
  await prisma.$transaction(async (tx) => {
    for (const recipe of recipes) {
      const id = generateId()

      const result = await tx.recipe.create({
        data: {
          id,
          userId: recipe.userId,
          title: recipe.title,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          totalTime: recipe.totalTime,
          yield: recipe.yield,
          archived: recipe.archived || false,
          createdAt: now,
          updatedAt: now,
          tags: {
            connect: recipe.tags.map((tag) => ({ id: tag.id })),
          },
        },
        include: { tags: true },
      })

      createdRecipes.push({
        ...result,
        ingredients: result.ingredients as GroupData[],
        instructions: result.instructions as string[],
      })
    }
  })

  return createdRecipes
}

export async function updateRecipe(
  id: string,
  updates: Partial<Omit<Recipe, 'id'>>
): Promise<Recipe | null> {
  // Input validation
  if (!id || typeof id !== 'string') {
    console.error('updateRecipe: Invalid recipe ID provided')
    return null
  }

  if (!updates || typeof updates !== 'object') {
    console.error('updateRecipe: Invalid updates object provided')
    return null
  }

  // Check if there are any actual updates to perform
  const { tags, userId: _userId, createdAt: _createdAt, ...directUpdates } = updates
  const hasDirectUpdates = Object.values(directUpdates).some((value) => value !== undefined)
  const hasTagUpdates = tags !== undefined

  if (!hasDirectUpdates && !hasTagUpdates) {
    console.warn('updateRecipe: No updates provided')
    // Fetch and return existing recipe instead of doing unnecessary DB call
    return await getRecipeById(id)
  }

  // Build update data object, filtering out undefined values
  const updateData: {
    title?: string
    ingredients?: GroupData[]
    instructions?: string[]
    totalTime?: string | null
    yield?: string | null
    archived?: boolean
    updatedAt: Date
    tags?: {
      set: { id: string }[]
    }
  } = {
    ...Object.fromEntries(Object.entries(directUpdates).filter(([, value]) => value !== undefined)),
    updatedAt: new Date(), // Always update the timestamp
  }

  // Handle tags update separately due to different structure
  if (tags !== undefined) {
    updateData.tags = {
      set: tags.map((tag) => ({ id: tag.id })),
    }
  }

  try {
    const updatedRecipe = await prisma.recipe.update({
      where: { id },
      data: updateData,
      include: { tags: true },
    })

    return {
      ...updatedRecipe,
      ingredients: updatedRecipe.ingredients as GroupData[],
      instructions: updatedRecipe.instructions as string[],
    }
  } catch (error) {
    // Check for specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Record to update not found')) {
        console.error(`updateRecipe: Recipe with ID '${id}' not found`)
      } else if (error.message.includes('Foreign key constraint failed')) {
        console.error(`updateRecipe: Invalid tag references in update for recipe '${id}'`)
      } else {
        console.error(`updateRecipe: Failed to update recipe '${id}':`, error.message)
      }
    } else {
      console.error(`updateRecipe: Unknown error updating recipe '${id}':`, error)
    }
    return null
  }
}

export async function deleteRecipe(id: string): Promise<boolean> {
  try {
    await prisma.recipe.delete({
      where: { id },
    })
    return true
  } catch (_error) {
    return false
  }
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const row = await prisma.recipe.findUnique({
    where: { id },
    include: { tags: true },
  })

  if (!row) return null

  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    ingredients: row.ingredients as GroupData[],
    instructions: row.instructions as string[],
    tags: row.tags,
    archived: Boolean(row.archived),
    totalTime: row.totalTime,
    yield: row.yield,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function getAllRecipes(userId?: string, archived: boolean = false): Promise<Recipe[]> {
  const recipes = await prisma.recipe.findMany({
    include: { tags: true },
    where: {
      ...(userId && { userId }),
      ...(archived !== undefined && { archived }),
    },
  })

  return recipes.map((recipe) => ({
    ...recipe,
    ingredients: recipe.ingredients as GroupData[],
    instructions: recipe.instructions as string[],
  }))
}

// Tag operations
export async function createTag(tag: Tag): Promise<Tag> {
  const result = await prisma.tag.create({
    data: {
      id: tag.id,
      displayName: tag.displayName,
    },
  })
  return result
}

export async function updateTag(
  id: string,
  updates: Partial<Omit<Tag, 'id'>>
): Promise<Tag | null> {
  try {
    const result = await prisma.tag.update({
      where: { id },
      data: updates,
    })
    return result
  } catch (_error) {
    return null
  }
}

export async function deleteTag(id: string): Promise<boolean> {
  try {
    await prisma.tag.delete({
      where: { id },
    })
    return true
  } catch (_error) {
    return false
  }
}

export async function getTagById(id: string): Promise<Tag | null> {
  const row = await prisma.tag.findUnique({
    where: { id },
  })

  if (!row) return null

  return {
    id: row.id,
    displayName: row.displayName,
  }
}

export async function getAllTags(): Promise<Tag[]> {
  const prisma = (await import('./prisma')).default
  const rows = await prisma.tag.findMany({
    orderBy: { displayName: 'asc' },
    select: {
      id: true,
      displayName: true,
    },
  })

  return rows.map((row) => ({
    id: row.id,
    displayName: row.displayName,
  }))
}

// User config operations
export async function getUserConfig(): Promise<UserConfig> {
  const rows = await prisma.userConfig.findMany()

  const config: Record<string, string> = {}
  for (const row of rows) {
    config[row.key] = row.value
  }

  // Provide defaults with proper type casting
  return {
    name: config.name || 'Demo User',
    theme: config.theme || 'dark',
    language: config.language || 'en',
    defaultSort:
      (config.defaultSort as
        | 'random'
        | 'title-asc'
        | 'title-desc'
        | 'updated-asc'
        | 'updated-desc') || 'updated-asc',
    defaultLayout: (config.defaultLayout as 'grid' | 'list') || undefined,
    defaultGridCols: config.defaultGridCols ? parseInt(config.defaultGridCols, 10) : undefined,
  }
}

export async function updateUserConfig(updates: Partial<UserConfig>): Promise<UserConfig> {
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      await prisma.userConfig.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    }
  }

  return await getUserConfig()
}

// Shopping list operations
export async function getShoppingList(): Promise<ShoppingListItem[]> {
  const rows = await prisma.shoppingListItem.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  return rows.map((row) => ({
    text: row.text,
    checked: Boolean(row.checked),
  }))
}

export async function updateShoppingList(items: ShoppingListItem[]): Promise<void> {
  // Clear existing items
  await prisma.shoppingListItem.deleteMany()

  // Insert new items
  const data = items.map((item, index) => ({
    text: item.text,
    checked: item.checked,
    sortOrder: index,
  }))

  if (data.length > 0) {
    await prisma.shoppingListItem.createMany({
      data,
    })
  }
}

// Export all data as JSON (for static builds)
export async function exportToJson(userId?: string, archived?: boolean): Promise<DatabaseSchema> {
  const allRecipes = userId
    ? await getAllRecipes(userId, archived)
    : await prisma.recipe
        .findMany({
          include: { tags: true },
          where: archived !== undefined ? { archived } : undefined,
          orderBy: { updatedAt: 'desc' },
        })
        .then((recipes) =>
          recipes.map((recipe) => ({
            ...recipe,
            ingredients: recipe.ingredients as GroupData[],
            instructions: recipe.instructions as string[],
          }))
        )

  return {
    recipes: allRecipes,
    tags: await getAllTags(),
    userConfig: await getUserConfig(),
    shoppingList: await getShoppingList(),
  }
}

// Import data from JSON (for data migration/import)
export async function importFromJson(data: DatabaseSchema): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Clear existing data
    await tx.shoppingListItem.deleteMany()
    await tx.recipe.deleteMany()
    await tx.tag.deleteMany()
    await tx.userConfig.deleteMany()

    // Import tags first (recipes depend on them)
    for (const tag of data.tags) {
      await tx.tag.create({
        data: {
          id: tag.id,
          displayName: tag.displayName,
        },
      })
    }

    // Import recipes
    for (const recipe of data.recipes) {
      await tx.recipe.create({
        data: {
          id: recipe.id,
          userId: recipe.userId || 'imported',
          title: recipe.title,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          totalTime: recipe.totalTime,
          yield: recipe.yield,
          archived: recipe.archived || false,
          createdAt: recipe.createdAt,
          updatedAt: recipe.updatedAt,
          tags: {
            connect: recipe.tags.map((tag) => ({ id: tag.id })),
          },
        },
      })
    }

    // Import user config
    for (const [key, value] of Object.entries(data.userConfig)) {
      if (value !== undefined) {
        await tx.userConfig.create({
          data: {
            key,
            value: String(value),
          },
        })
      }
    }

    // Import shopping list
    if (data.shoppingList) {
      for (const [index, item] of data.shoppingList.entries()) {
        await tx.shoppingListItem.create({
          data: {
            text: item.text,
            checked: item.checked,
            sortOrder: index,
          },
        })
      }
    }
  })
}

// Utility function to generate IDs (matching your current format)
function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
