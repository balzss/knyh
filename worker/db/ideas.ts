import type { Idea } from '../../shared/types'
import { generateId } from '../../shared/id'
import { toIso } from './util'
import { getRecipe, insertRecipeStatements, type RecipeJson } from './recipes'

type IdeaRow = { id: string; title: string; notes: string; created_at: string }

const toIdea = (row: IdeaRow): Idea => ({
  id: row.id,
  title: row.title,
  notes: JSON.parse(row.notes),
  createdAt: row.created_at,
})

export async function listIdeas(db: D1Database): Promise<Idea[]> {
  const { results } = await db
    .prepare('SELECT id, title, notes, created_at FROM ideas ORDER BY position')
    .all<IdeaRow>()
  return results.map(toIdea)
}

async function getIdea(db: D1Database, id: string): Promise<Idea | null> {
  const row = await db
    .prepare('SELECT id, title, notes, created_at FROM ideas WHERE id = ?')
    .bind(id)
    .first<IdeaRow>()
  return row ? toIdea(row) : null
}

/** New ideas go to the bottom of the list. */
export async function createIdea(
  db: D1Database,
  input: { title: string; notes?: string[] }
): Promise<Idea> {
  const id = generateId()
  await db
    .prepare(
      `INSERT INTO ideas (id, position, title, notes, created_at)
       VALUES (?, (SELECT COALESCE(MAX(position), -1) + 1 FROM ideas), ?, ?, ?)`
    )
    .bind(id, input.title, JSON.stringify(input.notes ?? []), new Date().toISOString())
    .run()
  return (await getIdea(db, id))!
}

export async function updateIdea(
  db: D1Database,
  id: string,
  input: { title: string; notes: string[] }
): Promise<Idea | null> {
  const { meta } = await db
    .prepare('UPDATE ideas SET title = ?, notes = ? WHERE id = ?')
    .bind(input.title, JSON.stringify(input.notes), id)
    .run()
  return meta.changes > 0 ? getIdea(db, id) : null
}

export async function deleteIdea(db: D1Database, id: string): Promise<boolean> {
  const { meta } = await db.prepare('DELETE FROM ideas WHERE id = ?').bind(id).run()
  return meta.changes > 0
}

/** Ranks ideas by their place in `ids`. Ideas left out keep their order, after the listed ones. */
export async function reorderIdeas(db: D1Database, ids: string[]): Promise<Idea[]> {
  await db.batch(
    ids.map((id, index) =>
      db.prepare('UPDATE ideas SET position = ? WHERE id = ?').bind(index - ids.length, id)
    )
  )
  return listIdeas(db)
}

/**
 * Turns an idea into an in-development recipe: the title and notes carry over and the idea is
 * removed. Both happen in one batch, so a failure leaves the idea where it was.
 */
export async function developIdea(db: D1Database, id: string): Promise<RecipeJson | null> {
  const idea = await getIdea(db, id)
  if (!idea) return null
  const recipeId = generateId()
  const now = new Date().toISOString()
  await db.batch([
    ...insertRecipeStatements(
      db,
      recipeId,
      {
        title: idea.title,
        ingredients: [],
        instructions: [],
        notes: idea.notes,
        status: 'development',
      },
      now,
      now
    ),
    db.prepare('DELETE FROM ideas WHERE id = ?').bind(id),
  ])
  return getRecipe(db, recipeId)
}

/**
 * Reverses developIdea: removes the recipe and puts the idea back at `index` in the ranking.
 * Refuses when the recipe has been edited since it was created, so no work is thrown away.
 */
export async function undevelopIdea(
  db: D1Database,
  recipeId: string,
  idea: Idea,
  index: number
): Promise<'restored' | 'edited'> {
  const recipe = await db
    .prepare('SELECT created_at, updated_at FROM recipes WHERE id = ?')
    .bind(recipeId)
    .first<{ created_at: string; updated_at: string }>()
  if (recipe && recipe.created_at !== recipe.updated_at) return 'edited'

  // Already back, e.g. from a double click
  if (await getIdea(db, idea.id)) return 'restored'

  const ids = (await listIdeas(db)).map((i) => i.id)
  ids.splice(Math.min(Math.max(index, 0), ids.length), 0, idea.id)
  await db.batch([
    db.prepare('DELETE FROM recipes WHERE id = ?').bind(recipeId),
    db
      .prepare('INSERT INTO ideas (id, position, title, notes, created_at) VALUES (?, ?, ?, ?, ?)')
      .bind(idea.id, 0, idea.title, JSON.stringify(idea.notes), toIso(idea.createdAt)),
    ...ids.map((id, position) =>
      db.prepare('UPDATE ideas SET position = ? WHERE id = ?').bind(position, id)
    ),
  ])
  return 'restored'
}

export function ideaStatements(db: D1Database, ideas: Idea[]): D1PreparedStatement[] {
  return [
    db.prepare('DELETE FROM ideas'),
    ...ideas.map((idea, index) =>
      db
        .prepare(
          'INSERT INTO ideas (id, position, title, notes, created_at) VALUES (?, ?, ?, ?, ?)'
        )
        .bind(idea.id, index, idea.title, JSON.stringify(idea.notes), toIso(idea.createdAt))
    ),
  ]
}
