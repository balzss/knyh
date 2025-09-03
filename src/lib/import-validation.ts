/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DatabaseSchema, Tag, UserConfig, GroupData } from './types'

/**
 * Validation functions for import data
 */

export function isValidGroupData(obj: unknown): obj is GroupData {
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

export function isValidTag(obj: unknown): obj is Tag {
  if (typeof obj !== 'object' || obj === null) return false
  const record = obj as Record<string, unknown>

  return (
    'id' in record &&
    typeof record.id === 'string' &&
    'displayName' in record &&
    typeof record.displayName === 'string'
  )
}

export function isValidUserConfig(obj: unknown): obj is UserConfig {
  if (typeof obj !== 'object' || obj === null) return false
  const record = obj as Record<string, unknown>

  return (
    'name' in record &&
    typeof record.name === 'string' &&
    'theme' in record &&
    typeof record.theme === 'string' &&
    'language' in record &&
    typeof record.language === 'string'
  )
}

// Import-specific recipe validation (handles legacy format)
export function isValidImportRecipe(obj: unknown): obj is any {
  if (typeof obj !== 'object' || obj === null) return false
  const record = obj as Record<string, unknown>

  const hasBasicFields =
    'id' in record &&
    typeof record.id === 'string' &&
    'title' in record &&
    typeof record.title === 'string' &&
    'ingredients' in record &&
    Array.isArray(record.ingredients) &&
    'instructions' in record &&
    Array.isArray(record.instructions) &&
    'tags' in record &&
    Array.isArray(record.tags)

  if (!hasBasicFields) return false

  // Validate ingredients (either GroupData[] or string[])
  const ingredients = record.ingredients as unknown[]
  const validIngredients = ingredients.every((ing) => {
    // Support legacy string[] format
    if (typeof ing === 'string') return true
    // Support new GroupData format
    return isValidGroupData(ing)
  })

  if (!validIngredients) return false

  // Validate instructions
  const instructions = record.instructions as unknown[]
  if (!instructions.every((inst: unknown) => typeof inst === 'string')) {
    return false
  }

  // Validate tags (either string[] or Tag[])
  const tags = record.tags as unknown[]
  const validTags = tags.every((tag) => {
    // Support legacy string[] format
    if (typeof tag === 'string') return true
    // Support new Tag format
    return isValidTag(tag)
  })

  return validTags
}

export function isValidDatabaseSchema(obj: unknown): obj is DatabaseSchema {
  if (typeof obj !== 'object' || obj === null) return false
  const record = obj as Record<string, unknown>

  return (
    'recipes' in record &&
    Array.isArray(record.recipes) &&
    record.recipes.every(isValidImportRecipe) &&
    'tags' in record &&
    Array.isArray(record.tags) &&
    record.tags.every(isValidTag) &&
    'userConfig' in record &&
    isValidUserConfig(record.userConfig)
  )
}

/**
 * Normalize import data to match current schema
 */
export function normalizeImportData(data: any): DatabaseSchema {
  return {
    ...data,
    recipes: data.recipes.map((recipe: any) => {
      // Normalize ingredients to GroupData[] format
      let ingredients = recipe.ingredients
      if (
        Array.isArray(ingredients) &&
        ingredients.length > 0 &&
        typeof ingredients[0] === 'string'
      ) {
        ingredients = [{ label: '', items: ingredients }]
      }

      // Normalize tags to Tag[] format
      let tags = recipe.tags
      if (Array.isArray(tags) && tags.length > 0 && typeof tags[0] === 'string') {
        tags = tags.map((tagId: string) => {
          const tagData = data.tags.find((t: any) => t.id === tagId)
          return tagData || { id: tagId, displayName: tagId }
        })
      }

      // Handle legacy metadata format
      const totalTime = recipe.metadata?.totalTime || recipe.totalTime || null
      const yield_ = recipe.metadata?.yield || recipe.yield || null

      // Normalize dates
      const createdAt = recipe.createdAt ? new Date(recipe.createdAt) : new Date()
      const updatedAt = recipe.lastModified
        ? new Date(recipe.lastModified)
        : recipe.updatedAt
          ? new Date(recipe.updatedAt)
          : new Date()

      return {
        ...recipe,
        userId: recipe.userId || 'imported',
        ingredients,
        tags,
        totalTime,
        yield: yield_,
        createdAt,
        updatedAt,
        archived: recipe.archived || false,
      }
    }),
    userConfig: {
      name: data.userConfig.name || 'Imported User',
      theme: data.userConfig.theme || 'dark',
      language: data.userConfig.language || 'en',
      ...data.userConfig,
    },
    shoppingList: data.shoppingList || [],
  }
}

/**
 * Validate uniqueness of IDs
 */
export function validateUniqueIds(data: DatabaseSchema): { valid: boolean; error?: string } {
  // Check recipe ID uniqueness
  const recipeIds = new Set<string>()
  for (const recipe of data.recipes) {
    if (recipeIds.has(recipe.id)) {
      return { valid: false, error: `Duplicate recipe ID: ${recipe.id}` }
    }
    recipeIds.add(recipe.id)
  }

  // Check tag ID uniqueness
  const tagIds = new Set<string>()
  for (const tag of data.tags) {
    if (tagIds.has(tag.id)) {
      return { valid: false, error: `Duplicate tag ID: ${tag.id}` }
    }
    tagIds.add(tag.id)
  }

  return { valid: true }
}
