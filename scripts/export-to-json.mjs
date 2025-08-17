#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import Database from 'better-sqlite3'

const dbPath = path.join(process.cwd(), 'data', 'recipes.db')
const outputPath = path.join(process.cwd(), 'public', 'data', 'data.json')

try {
  console.log('📊 Exporting SQLite data to JSON...')
  
  if (!fs.existsSync(dbPath)) {
    console.error('❌ SQLite database not found at:', dbPath)
    process.exit(1)
  }
  
  const db = new Database(dbPath)
  
  // Export recipes
  const recipesStmt = db.prepare('SELECT * FROM recipes ORDER BY created_at DESC')
  const recipeRows = recipesStmt.all()
  
  const recipes = recipeRows.map(row => ({
    id: row.id,
    title: row.title,
    ingredients: JSON.parse(row.ingredients),
    instructions: JSON.parse(row.instructions),
    tags: JSON.parse(row.tags),
    metadata: {
      totalTime: row.total_time,
      yield: row.yield
    },
    archived: Boolean(row.archived),
    createdAt: row.created_at,
    lastModified: row.last_modified
  }))
  
  // Export tags
  const tagsStmt = db.prepare('SELECT * FROM tags ORDER BY display_name')
  const tagRows = tagsStmt.all()
  
  const tags = tagRows.map(row => ({
    id: row.id,
    displayName: row.display_name
  }))
  
  // Export user config
  const configStmt = db.prepare('SELECT * FROM user_config')
  const configRows = configStmt.all()
  
  const userConfig = {}
  for (const row of configRows) {
    userConfig[row.key] = row.value
  }
  
  // Provide defaults
  const finalConfig = {
    userId: userConfig.userId || 'user',
    theme: userConfig.theme || 'dark',
    language: userConfig.language || 'en'
  }
  
  db.close()
  
  const data = {
    recipes,
    tags,
    userConfig: finalConfig
  }
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputPath)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2))
  
  console.log(`✅ Exported ${data.recipes.length} recipes and ${data.tags.length} tags to JSON`)
  console.log('📍 JSON file created at:', outputPath)
  
} catch (error) {
  console.error('❌ Export failed:', error)
  process.exit(1)
}
