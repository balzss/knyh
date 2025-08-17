import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import type { Recipe, Tag, UserConfig, DatabaseSchema, GroupData } from './types'

// Database setup
const dbPath = path.join(process.cwd(), 'data', 'recipes.db')

// Ensure data directory exists
const dataDir = path.dirname(dbPath)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath)
    initializeDb(db)
  }
  return db
}

function initializeDb(database: Database.Database) {
  // Create tables
  database.exec(`
    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      ingredients TEXT NOT NULL, -- JSON array of GroupData
      instructions TEXT NOT NULL, -- JSON array of strings
      tags TEXT NOT NULL, -- JSON array of tag IDs
      total_time TEXT,
      yield TEXT,
      archived INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      last_modified TEXT NOT NULL
    )
  `)

  database.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL
    )
  `)

  database.exec(`
    CREATE TABLE IF NOT EXISTS user_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `)

  // Create indexes for better performance
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_recipes_archived ON recipes(archived);
    CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes(created_at);
  `)
}

// Recipe operations
export function createRecipe(recipe: Omit<Recipe, 'id'>): Recipe {
  const db = getDb()
  const id = generateId()
  const now = new Date().toISOString().slice(0, 16).replace('T', '-').replace(':', '-')
  
  const stmt = db.prepare(`
    INSERT INTO recipes (id, title, ingredients, instructions, tags, total_time, yield, archived, created_at, last_modified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  
  stmt.run(
    id,
    recipe.title,
    JSON.stringify(recipe.ingredients),
    JSON.stringify(recipe.instructions),
    JSON.stringify(recipe.tags),
    recipe.metadata.totalTime,
    recipe.metadata.yield,
    recipe.archived ? 1 : 0,
    recipe.createdAt || now,
    recipe.lastModified || now
  )
  
  return {
    ...recipe,
    id,
    createdAt: recipe.createdAt || now,
    lastModified: recipe.lastModified || now
  }
}

export function updateRecipe(id: string, updates: Partial<Omit<Recipe, 'id'>>): Recipe | null {
  const db = getDb()
  const now = new Date().toISOString().slice(0, 16).replace('T', '-').replace(':', '-')
  
  // Build dynamic update query
  const updateFields: string[] = []
  const values: any[] = []
  
  if (updates.title !== undefined) {
    updateFields.push('title = ?')
    values.push(updates.title)
  }
  if (updates.ingredients !== undefined) {
    updateFields.push('ingredients = ?')
    values.push(JSON.stringify(updates.ingredients))
  }
  if (updates.instructions !== undefined) {
    updateFields.push('instructions = ?')
    values.push(JSON.stringify(updates.instructions))
  }
  if (updates.tags !== undefined) {
    updateFields.push('tags = ?')
    values.push(JSON.stringify(updates.tags))
  }
  if (updates.metadata !== undefined) {
    if (updates.metadata.totalTime !== undefined) {
      updateFields.push('total_time = ?')
      values.push(updates.metadata.totalTime)
    }
    if (updates.metadata.yield !== undefined) {
      updateFields.push('yield = ?')
      values.push(updates.metadata.yield)
    }
  }
  if (updates.archived !== undefined) {
    updateFields.push('archived = ?')
    values.push(updates.archived ? 1 : 0)
  }
  
  updateFields.push('last_modified = ?')
  values.push(now)
  values.push(id)
  
  const stmt = db.prepare(`
    UPDATE recipes 
    SET ${updateFields.join(', ')}
    WHERE id = ?
  `)
  
  const result = stmt.run(...values)
  
  if (result.changes === 0) {
    return null
  }
  
  return getRecipeById(id)
}

export function deleteRecipe(id: string): boolean {
  const db = getDb()
  const stmt = db.prepare('DELETE FROM recipes WHERE id = ?')
  const result = stmt.run(id)
  return result.changes > 0
}

export function getRecipeById(id: string): Recipe | null {
  const db = getDb()
  const stmt = db.prepare('SELECT * FROM recipes WHERE id = ?')
  const row = stmt.get(id) as any
  
  if (!row) return null
  
  return {
    id: row.id,
    title: row.title,
    ingredients: JSON.parse(row.ingredients) as GroupData[],
    instructions: JSON.parse(row.instructions) as string[],
    tags: JSON.parse(row.tags) as string[],
    metadata: {
      totalTime: row.total_time,
      yield: row.yield
    },
    archived: Boolean(row.archived),
    createdAt: row.created_at,
    lastModified: row.last_modified
  }
}

export function getAllRecipes(): Recipe[] {
  const db = getDb()
  const stmt = db.prepare('SELECT * FROM recipes ORDER BY created_at DESC')
  const rows = stmt.all() as any[]
  
  return rows.map(row => ({
    id: row.id,
    title: row.title,
    ingredients: JSON.parse(row.ingredients) as GroupData[],
    instructions: JSON.parse(row.instructions) as string[],
    tags: JSON.parse(row.tags) as string[],
    metadata: {
      totalTime: row.total_time,
      yield: row.yield
    },
    archived: Boolean(row.archived),
    createdAt: row.created_at,
    lastModified: row.last_modified
  }))
}

// Tag operations
export function createTag(tag: Tag): Tag {
  const db = getDb()
  const stmt = db.prepare('INSERT INTO tags (id, display_name) VALUES (?, ?)')
  stmt.run(tag.id, tag.displayName)
  return tag
}

export function updateTag(id: string, updates: Partial<Omit<Tag, 'id'>>): Tag | null {
  const db = getDb()
  
  if (updates.displayName !== undefined) {
    const stmt = db.prepare('UPDATE tags SET display_name = ? WHERE id = ?')
    const result = stmt.run(updates.displayName, id)
    
    if (result.changes === 0) {
      return null
    }
  }
  
  return getTagById(id)
}

export function deleteTag(id: string): boolean {
  const db = getDb()
  const stmt = db.prepare('DELETE FROM tags WHERE id = ?')
  const result = stmt.run(id)
  return result.changes > 0
}

export function getTagById(id: string): Tag | null {
  const db = getDb()
  const stmt = db.prepare('SELECT * FROM tags WHERE id = ?')
  const row = stmt.get(id) as any
  
  if (!row) return null
  
  return {
    id: row.id,
    displayName: row.display_name
  }
}

export function getAllTags(): Tag[] {
  const db = getDb()
  const stmt = db.prepare('SELECT * FROM tags ORDER BY display_name')
  const rows = stmt.all() as any[]
  
  return rows.map(row => ({
    id: row.id,
    displayName: row.display_name
  }))
}

// User config operations
export function getUserConfig(): UserConfig {
  const db = getDb()
  const stmt = db.prepare('SELECT * FROM user_config')
  const rows = stmt.all() as any[]
  
  const config: Partial<UserConfig> = {}
  for (const row of rows) {
    config[row.key as keyof UserConfig] = row.value
  }
  
  // Provide defaults
  return {
    userId: config.userId || 'user',
    theme: (config.theme as 'light' | 'dark') || 'dark',
    language: config.language || 'en'
  }
}

export function updateUserConfig(updates: Partial<UserConfig>): UserConfig {
  const db = getDb()
  const stmt = db.prepare('INSERT OR REPLACE INTO user_config (key, value) VALUES (?, ?)')
  
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      stmt.run(key, value)
    }
  }
  
  return getUserConfig()
}

// Export all data as JSON (for static builds)
export function exportToJson(): DatabaseSchema {
  return {
    recipes: getAllRecipes(),
    tags: getAllTags(),
    userConfig: getUserConfig()
  }
}

// Import data from JSON (for migration)
export function importFromJson(data: DatabaseSchema): void {
  const db = getDb()
  
  // Clear existing data
  db.exec('DELETE FROM recipes')
  db.exec('DELETE FROM tags')
  db.exec('DELETE FROM user_config')
  
  // Import recipes
  const recipeStmt = db.prepare(`
    INSERT INTO recipes (id, title, ingredients, instructions, tags, total_time, yield, archived, created_at, last_modified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  
  for (const recipe of data.recipes) {
    recipeStmt.run(
      recipe.id,
      recipe.title,
      JSON.stringify(recipe.ingredients),
      JSON.stringify(recipe.instructions),
      JSON.stringify(recipe.tags),
      recipe.metadata.totalTime,
      recipe.metadata.yield,
      recipe.archived ? 1 : 0,
      recipe.createdAt,
      recipe.lastModified
    )
  }
  
  // Import tags
  const tagStmt = db.prepare('INSERT INTO tags (id, display_name) VALUES (?, ?)')
  for (const tag of data.tags) {
    tagStmt.run(tag.id, tag.displayName)
  }
  
  // Import user config
  const configStmt = db.prepare('INSERT INTO user_config (key, value) VALUES (?, ?)')
  for (const [key, value] of Object.entries(data.userConfig)) {
    configStmt.run(key, value)
  }
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

// Close database connection
export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}
