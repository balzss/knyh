#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import Database from 'better-sqlite3'

const jsonPath = path.join(process.cwd(), 'public', 'data', 'data.json')
const dbPath = path.join(process.cwd(), 'data', 'recipes.db')

if (!fs.existsSync(jsonPath)) {
  console.error('❌ JSON data file not found at:', jsonPath)
  process.exit(1)
}

// Ensure data directory exists
const dataDir = path.dirname(dbPath)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

try {
  console.log('📖 Reading JSON data...')
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
  
  console.log(`📊 Found ${jsonData.recipes.length} recipes and ${jsonData.tags.length} tags`)
  
  console.log('🔄 Importing to SQLite...')
  
  // Initialize database
  const db = new Database(dbPath)
  
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      ingredients TEXT NOT NULL,
      instructions TEXT NOT NULL,
      tags TEXT NOT NULL,
      total_time TEXT,
      yield TEXT,
      archived INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      last_modified TEXT NOT NULL
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS user_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `)

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_recipes_archived ON recipes(archived);
    CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes(created_at);
  `)
  
  // Clear existing data
  db.exec('DELETE FROM recipes')
  db.exec('DELETE FROM tags')
  db.exec('DELETE FROM user_config')
  
  // Import recipes with data format conversion
  const recipeStmt = db.prepare(`
    INSERT INTO recipes (id, title, ingredients, instructions, tags, total_time, yield, archived, created_at, last_modified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  
  for (const recipe of jsonData.recipes) {
    // Convert ingredients from string[] to GroupData[] format if needed
    let ingredients = recipe.ingredients
    if (Array.isArray(ingredients) && ingredients.length > 0 && typeof ingredients[0] === 'string') {
      // Convert string array to GroupData format
      ingredients = [{ label: '', items: ingredients }]
      console.log(`🔄 Converting ingredients format for recipe: ${recipe.title}`)
    }
    
    recipeStmt.run(
      recipe.id,
      recipe.title,
      JSON.stringify(ingredients),
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
  for (const tag of jsonData.tags) {
    tagStmt.run(tag.id, tag.displayName)
  }
  
  // Import user config
  const configStmt = db.prepare('INSERT INTO user_config (key, value) VALUES (?, ?)')
  for (const [key, value] of Object.entries(jsonData.userConfig)) {
    configStmt.run(key, value)
  }
  
  db.close()
  
  console.log('✅ Migration completed successfully!')
  console.log('📍 SQLite database created at: ./data/recipes.db')
  
} catch (error) {
  console.error('❌ Migration failed:', error)
  process.exit(1)
}
