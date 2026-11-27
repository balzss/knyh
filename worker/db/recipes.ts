import { sortTags, type GroupData, type RecipeStatus, type Tag } from '../../shared/types'
import { generateId } from '../../shared/id'

/** A recipe as sent over the wire: dates are ISO strings. */
export type RecipeJson = {
  id: string
  title: string
  ingredients: GroupData[]
  instructions: string[]
  notes: string[]
  tags: Tag[]
  archived: boolean
  status: RecipeStatus
  totalTime: string | null
  yield: string | null
  createdAt: string
  updatedAt: string
}

export type RecipeInput = {
  title: string
  ingredients: GroupData[]
  instructions: string[]
  notes?: string[]
  tags?: { id: string }[]
  totalTime?: string | null
  yield?: string | null
  archived?: boolean
  status?: RecipeStatus
}

type RecipeRow = {
  id: string
  title: string
  ingredients: string
  instructions: string
  notes: string
  total_time: string | null
  yield: string | null
  archived: number
  status: RecipeStatus
  created_at: string
  updated_at: string
}

async function tagsByRecipe(db: D1Database, recipeId?: string): Promise<Map<string, Tag[]>> {
  const sql = `SELECT rt.recipe_id AS recipe_id, t.id AS id, t.display_name AS display_name
    FROM recipe_tags rt JOIN tags t ON t.id = rt.tag_id
    ${recipeId ? 'WHERE rt.recipe_id = ?' : ''}`
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
  for (const [id, list] of map) map.set(id, sortTags(list))
  return map
}

const toRecipe = (row: RecipeRow, tags: Tag[]): RecipeJson => ({
  id: row.id,
  title: row.title,
  ingredients: JSON.parse(row.ingredients),
  instructions: JSON.parse(row.instructions),
  notes: JSON.parse(row.notes),
  tags,
  archived: Boolean(row.archived),
  status: row.status,
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

export async function getRecipe(db: D1Database, id: string): Promise<RecipeJson | null> {
  const row = await db.prepare('SELECT * FROM recipes WHERE id = ?').bind(id).first<RecipeRow>()
  if (!row) return null
  const tags = await tagsByRecipe(db, id)
  return toRecipe(row, tags.get(id) ?? [])
}

export function insertRecipeStatements(
  db: D1Database,
  id: string,
  recipe: RecipeInput,
  createdAt: string,
  updatedAt: string
): D1PreparedStatement[] {
  return [
    db
      .prepare(
        `INSERT INTO recipes (id, title, ingredients, instructions, notes, total_time, yield, archived, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        recipe.title,
        JSON.stringify(recipe.ingredients),
        JSON.stringify(recipe.instructions),
        JSON.stringify(recipe.notes ?? []),
        recipe.totalTime ?? null,
        recipe.yield ?? null,
        recipe.archived ? 1 : 0,
        recipe.status ?? 'development',
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
  if (updates.notes !== undefined) set('notes', JSON.stringify(updates.notes))
  if (updates.totalTime !== undefined) set('total_time', updates.totalTime)
  if (updates.yield !== undefined) set('yield', updates.yield)
  if (updates.archived !== undefined) set('archived', updates.archived ? 1 : 0)
  if (updates.status !== undefined) set('status', updates.status)
  // Switching between development and ready is bookkeeping, not an edit to the recipe.
  const statusOnly = Object.keys(updates).every(
    (key) => key === 'status' || updates[key as keyof typeof updates] === undefined
  )
  if (!statusOnly) set('updated_at', new Date().toISOString())

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
