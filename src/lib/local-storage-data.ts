/**
 * Local Storage Data Manager for Static Export Mode
 *
 * This module provides CRUD operations using localStorage as the persistence layer.
 * It's used when the app is in static export mode and cannot use SQLite database.
 */

import { DatabaseSchema, Recipe, Tag, UserConfig, ShoppingListItem } from './types'
import { clientDataPath } from './utils'

const STORAGE_KEY = 'knyh-data'

/**
 * Generate a simple ID for new records
 */
function generateId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get the current data from localStorage, falling back to the static JSON file
 */
async function getData(): Promise<DatabaseSchema> {
  try {
    // Always fetch the JSON file to get the user name
    const response = await fetch(clientDataPath)
    let jsonData: DatabaseSchema | null = null
    if (response.ok) {
      jsonData = await response.json()
    }

    // Try to get data from localStorage for other data
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const localData = JSON.parse(stored)
      // Use JSON data for user name, localStorage for everything else
      return {
        ...localData,
        userConfig: {
          ...localData.userConfig,
          name: jsonData?.userConfig?.name || localData.userConfig?.name || 'Local User',
        },
      }
    }

    // If no localStorage data, use JSON data as initial data and store it
    if (jsonData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jsonData))
      return jsonData
    }

    // Final fallback if both fail
    throw new Error('No data source available')
  } catch (error) {
    console.error('Failed to load data:', error)
    // Return empty schema as fallback
    return {
      recipes: [],
      tags: [],
      userConfig: {
        name: 'Local User',
        theme: 'light',
        language: 'en',
      },
      shoppingList: [],
    }
  }
}

/**
 * Save data to localStorage
 */
function saveData(data: DatabaseSchema): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/**
 * Recipe CRUD operations
 */
export const localStorageRecipes = {
  async getAll(): Promise<Recipe[]> {
    const data = await getData()
    return data.recipes
  },

  async create(recipes: Omit<Recipe, 'id'>[]): Promise<Recipe[]> {
    const data = await getData()
    const now = new Date().toISOString()

    const newRecipes = recipes.map((recipe) => ({
      ...recipe,
      id: generateId(),
      createdAt: now,
      lastModified: now,
    }))

    data.recipes.push(...newRecipes)
    saveData(data)
    return newRecipes
  },

  async update(id: string, updates: Omit<Recipe, 'id'>): Promise<Recipe> {
    const data = await getData()
    const index = data.recipes.findIndex((r) => r.id === id)

    if (index === -1) {
      throw new Error(`Recipe with id ${id} not found`)
    }

    const updatedRecipe = {
      ...updates,
      id,
      lastModified: new Date().toISOString(),
    }

    data.recipes[index] = updatedRecipe
    saveData(data)
    return updatedRecipe
  },

  async updateMany(ids: string[], updates: Partial<Omit<Recipe, 'id'>>): Promise<Recipe[]> {
    const data = await getData()
    const updatedRecipes: Recipe[] = []
    const now = new Date().toISOString()

    for (const id of ids) {
      const index = data.recipes.findIndex((r) => r.id === id)
      if (index !== -1) {
        data.recipes[index] = {
          ...data.recipes[index],
          ...updates,
          lastModified: now,
        }
        updatedRecipes.push(data.recipes[index])
      }
    }

    saveData(data)
    return updatedRecipes
  },

  async delete(id: string): Promise<void> {
    const data = await getData()
    const index = data.recipes.findIndex((r) => r.id === id)

    if (index === -1) {
      throw new Error(`Recipe with id ${id} not found`)
    }

    data.recipes.splice(index, 1)
    saveData(data)
  },

  async deleteMany(ids: string[]): Promise<void> {
    const data = await getData()
    data.recipes = data.recipes.filter((r) => !ids.includes(r.id))
    saveData(data)
  },
}

/**
 * Tag CRUD operations
 */
export const localStorageTags = {
  async getAll(): Promise<Tag[]> {
    const data = await getData()
    return data.tags
  },

  async create(displayName: string): Promise<Tag> {
    const data = await getData()
    const newTag: Tag = {
      id: generateId(),
      displayName,
    }

    data.tags.push(newTag)
    saveData(data)
    return newTag
  },

  async update(id: string, displayName: string): Promise<Tag> {
    const data = await getData()
    const index = data.tags.findIndex((t) => t.id === id)

    if (index === -1) {
      throw new Error(`Tag with id ${id} not found`)
    }

    data.tags[index].displayName = displayName
    saveData(data)
    return data.tags[index]
  },

  async delete(id: string): Promise<void> {
    const data = await getData()

    // Remove the tag
    const tagIndex = data.tags.findIndex((t) => t.id === id)
    if (tagIndex === -1) {
      throw new Error(`Tag with id ${id} not found`)
    }

    data.tags.splice(tagIndex, 1)

    // Remove tag references from recipes
    data.recipes.forEach((recipe) => {
      recipe.tags = recipe.tags.filter((tagId) => tagId !== id)
      recipe.lastModified = new Date().toISOString()
    })

    saveData(data)
  },
}

/**
 * Config operations
 */
export const localStorageConfig = {
  async get(): Promise<UserConfig> {
    const data = await getData()
    return data.userConfig
  },

  async update(updates: Partial<UserConfig>): Promise<UserConfig> {
    const data = await getData()
    data.userConfig = { ...data.userConfig, ...updates }
    saveData(data)
    return data.userConfig
  },
}

/**
 * Shopping List operations
 */
export const localStorageShoppingList = {
  async getAll(): Promise<ShoppingListItem[]> {
    const data = await getData()
    return data.shoppingList || []
  },

  async update(items: ShoppingListItem[]): Promise<void> {
    const data = await getData()
    data.shoppingList = items
    saveData(data)
  },
}

/**
 * Get all data (used by the main data hook)
 */
export async function getLocalStorageData(): Promise<DatabaseSchema> {
  return getData()
}
