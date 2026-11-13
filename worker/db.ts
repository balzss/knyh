import type { DatabaseSchema, GroupData, ShoppingListItem, Tag, UserConfig } from '../src/lib/types'
import { generateId } from '../src/lib/id'

/** A recipe as sent over the wire: dates are ISO strings. */
type RecipeJson = {
  id: string
  title: string
  ingredients: GroupData[]
  instructions: string[]
  tags: Tag[]
  archived: boolean
  totalTime: string | null
  yield: string | null
  createdAt: string
  updatedAt: string
}

type RecipeInput = {
  title: string
  ingredients: GroupData[]
  instructions: string[]
  tags?: { id: string }[]
  totalTime?: string | null
  yield?: string | null
  archived?: boolean
}

type RecipeRow = {
  id: string
  title: string
  ingredients: string
  instructions: string
  total_time: string | null
  yield: string | null
  archived: number
  created_at: string
  updated_at: string
}

const toIso = (value: unknown): string => {
  const date = value ? new Date(value as string) : new Date()
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

// ---------- Recipes ----------

async function tagsByRecipe(db: D1Database, recipeId?: string): Promise<Map<string, Tag[]>> {
  const sql = `SELECT rt.recipe_id AS recipe_id, t.id AS id, t.display_name AS display_name
    FROM recipe_tags rt JOIN tags t ON t.id = rt.tag_id
    ${recipeId ? 'WHERE rt.recipe_id = ?' : ''}
    ORDER BY t.display_name`
  const stmt = db.prepare(sql)
  const { results } = await (recipeId ? stmt.bind(recipeId) : stmt).all<{
    recipe_id: string
    id: string
    display_name: string
  }>()

  const map = new Map<string, Tag[]>()
  for (const row of results) {
    const list = map.get(row.recipe_id) ?? []
    list.push({ id: row.id, displayName: row.display_name })
    map.set(row.recipe_id, list)
  }
  return map
}

const toRecipe = (row: RecipeRow, tags: Tag[]): RecipeJson => ({
  id: row.id,
  title: row.title,
  ingredients: JSON.parse(row.ingredients),
  instructions: JSON.parse(row.instructions),
  tags,
  archived: Boolean(row.archived),
  totalTime: row.total_time,
  yield: row.yield,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export async function listRecipes(db: D1Database, archived?: boolean): Promise<RecipeJson[]> {
  const stmt = db.prepare(
    `SELECT * FROM recipes ${archived === undefined ? '' : 'WHERE archived = ?'} ORDER BY created_at DESC`
  )
  const { results } = await (
    archived === undefined ? stmt : stmt.bind(archived ? 1 : 0)
  ).all<RecipeRow>()
  const tags = await tagsByRecipe(db)
  return results.map((row) => toRecipe(row, tags.get(row.id) ?? []))
}

async function getRecipe(db: D1Database, id: string): Promise<RecipeJson | null> {
  const row = await db.prepare('SELECT * FROM recipes WHERE id = ?').bind(id).first<RecipeRow>()
  if (!row) return null
  const tags = await tagsByRecipe(db, id)
  return toRecipe(row, tags.get(id) ?? [])
}

function insertRecipeStatements(
  db: D1Database,
  id: string,
  recipe: RecipeInput,
  createdAt: string,
  updatedAt: string
): D1PreparedStatement[] {
  return [
    db
      .prepare(
        `INSERT INTO recipes (id, title, ingredients, instructions, total_time, yield, archived, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        recipe.title,
        JSON.stringify(recipe.ingredients),
        JSON.stringify(recipe.instructions),
        recipe.totalTime ?? null,
        recipe.yield ?? null,
        recipe.archived ? 1 : 0,
        createdAt,
        updatedAt
      ),
    ...(recipe.tags ?? []).map((tag) =>
      db
        .prepare('INSERT OR IGNORE INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)')
        .bind(id, tag.id)
    ),
  ]
}

export async function createRecipes(db: D1Database, recipes: RecipeInput[]): Promise<RecipeJson[]> {
  const now = new Date().toISOString()
  const ids = recipes.map(() => generateId())
  await db.batch(
    recipes.flatMap((recipe, i) => insertRecipeStatements(db, ids[i], recipe, now, now))
  )
  const created = await Promise.all(ids.map((id) => getRecipe(db, id)))
  return created.filter((recipe): recipe is RecipeJson => recipe !== null)
}

export async function updateRecipe(
  db: D1Database,
  id: string,
  updates: Partial<RecipeInput>
): Promise<RecipeJson | null> {
  const exists = await db.prepare('SELECT 1 AS found FROM recipes WHERE id = ?').bind(id).first()
  if (!exists) return null

  const sets: string[] = []
  const values: (string | number | null)[] = []
  const set = (column: string, value: string | number | null) => {
    sets.push(`${column} = ?`)
    values.push(value)
  }

  if (updates.title !== undefined) set('title', updates.title)
  if (updates.ingredients !== undefined) set('ingredients', JSON.stringify(updates.ingredients))
  if (updates.instructions !== undefined) set('instructions', JSON.stringify(updates.instructions))
  if (updates.totalTime !== undefined) set('total_time', updates.totalTime)
  if (updates.yield !== undefined) set('yield', updates.yield)
  if (updates.archived !== undefined) set('archived', updates.archived ? 1 : 0)
  set('updated_at', new Date().toISOString())

  const statements = [
    db.prepare(`UPDATE recipes SET ${sets.join(', ')} WHERE id = ?`).bind(...values, id),
  ]
  if (updates.tags !== undefined) {
    statements.push(db.prepare('DELETE FROM recipe_tags WHERE recipe_id = ?').bind(id))
    for (const tag of updates.tags) {
      statements.push(
        db
          .prepare('INSERT OR IGNORE INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)')
          .bind(id, tag.id)
      )
    }
  }
  await db.batch(statements)
  return getRecipe(db, id)
}

export async function deleteRecipe(db: D1Database, id: string): Promise<boolean> {
  const result = await db.prepare('DELETE FROM recipes WHERE id = ?').bind(id).run()
  return result.meta.changes > 0
}

// ---------- Tags ----------

export async function listTags(db: D1Database): Promise<Tag[]> {
  const { results } = await db
    .prepare('SELECT id, display_name FROM tags ORDER BY display_name')
    .all<{ id: string; display_name: string }>()
  return results.map((row) => ({ id: row.id, displayName: row.display_name }))
}

export async function createTag(db: D1Database, displayName: string): Promise<Tag> {
  const id = generateId()
  await db.prepare('INSERT INTO tags (id, display_name) VALUES (?, ?)').bind(id, displayName).run()
  return { id, displayName }
}

export async function renameTag(
  db: D1Database,
  id: string,
  displayName: string
): Promise<Tag | null> {
  const result = await db
    .prepare('UPDATE tags SET display_name = ? WHERE id = ?')
    .bind(displayName, id)
    .run()
  return result.meta.changes > 0 ? { id, displayName } : null
}

/** Deleting a tag removes it from every recipe through the ON DELETE CASCADE on recipe_tags. */
export async function deleteTag(db: D1Database, id: string): Promise<boolean> {
  const result = await db.prepare('DELETE FROM tags WHERE id = ?').bind(id).run()
  return result.meta.changes > 0
}

/** Case-insensitive name check, ignoring the tag with `exceptId`. */
export async function tagNameTaken(
  db: D1Database,
  name: string,
  exceptId?: string
): Promise<boolean> {
  const row = await db
    .prepare('SELECT id FROM tags WHERE display_name = ? AND id != ?')
    .bind(name, exceptId ?? '')
    .first()
  return row !== null
}

// ---------- Config ----------

const CONFIG_KEYS = ['name', 'language', 'defaultSort', 'defaultLayout', 'defaultGridCols'] as const

export async function getConfig(db: D1Database): Promise<UserConfig> {
  const { results } = await db
    .prepare('SELECT key, value FROM config')
    .all<{ key: string; value: string }>()
  const config: Record<string, string> = {}
  for (const row of results) config[row.key] = row.value

  return {
    name: config.name || 'KONYHA',
    language: config.language || 'en',
    defaultSort: (config.defaultSort as UserConfig['defaultSort']) || 'updated-asc',
    defaultLayout: (config.defaultLayout as UserConfig['defaultLayout']) || undefined,
    defaultGridCols: config.defaultGridCols ? parseInt(config.defaultGridCols, 10) : undefined,
  }
}

function configStatements(db: D1Database, updates: Partial<UserConfig>): D1PreparedStatement[] {
  return CONFIG_KEYS.filter((key) => updates[key] !== undefined).map((key) =>
    db
      .prepare(
        'INSERT INTO config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
      )
      .bind(key, String(updates[key]))
  )
}

export async function updateConfig(
  db: D1Database,
  updates: Partial<UserConfig>
): Promise<UserConfig> {
  const statements = configStatements(db, updates)
  if (statements.length > 0) await db.batch(statements)
  return getConfig(db)
}

// ---------- Shopping list ----------

export async function getShoppingList(db: D1Database): Promise<ShoppingListItem[]> {
  const { results } = await db
    .prepare('SELECT text, checked FROM shopping_list ORDER BY position')
    .all<{ text: string; checked: number }>()
  return results.map((row) => ({ text: row.text, checked: Boolean(row.checked) }))
}

function shoppingListStatements(db: D1Database, items: ShoppingListItem[]): D1PreparedStatement[] {
  return [
    db.prepare('DELETE FROM shopping_list'),
    ...items.map((item, index) =>
      db
        .prepare('INSERT INTO shopping_list (position, text, checked) VALUES (?, ?, ?)')
        .bind(index, item.text, item.checked ? 1 : 0)
    ),
  ]
}

export async function replaceShoppingList(
  db: D1Database,
  items: ShoppingListItem[]
): Promise<void> {
  await db.batch(shoppingListStatements(db, items))
}

// ---------- Export / import ----------

export async function exportAll(db: D1Database): Promise<DatabaseSchema> {
  const [recipes, tags, userConfig, shoppingList] = await Promise.all([
    listRecipes(db),
    listTags(db),
    getConfig(db),
    getShoppingList(db),
  ])
  // The client types dates as Date, but they cross the wire as ISO strings.
  return {
    recipes: recipes as unknown as DatabaseSchema['recipes'],
    tags,
    userConfig,
    shoppingList,
  }
}

/** Replaces everything in the database with the given data, in one transaction. */
export async function importAll(db: D1Database, data: DatabaseSchema): Promise<void> {
  const tagIds = new Set(data.tags.map((tag) => tag.id))

  const statements: D1PreparedStatement[] = [
    db.prepare('DELETE FROM recipe_tags'),
    db.prepare('DELETE FROM recipes'),
    db.prepare('DELETE FROM tags'),
    db.prepare('DELETE FROM config'),
    ...data.tags.map((tag) =>
      db.prepare('INSERT INTO tags (id, display_name) VALUES (?, ?)').bind(tag.id, tag.displayName)
    ),
    ...data.recipes.flatMap((recipe) =>
      insertRecipeStatements(
        db,
        recipe.id,
        { ...recipe, tags: recipe.tags.filter((tag) => tagIds.has(tag.id)) },
        toIso(recipe.createdAt),
        toIso(recipe.updatedAt)
      )
    ),
    ...configStatements(db, data.userConfig),
    ...shoppingListStatements(db, data.shoppingList ?? []),
  ]
  await db.batch(statements)
}
