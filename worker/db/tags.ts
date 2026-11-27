import { sortTags, type Tag } from '../../shared/types'
import { generateId } from '../../shared/id'

export async function listTags(db: D1Database): Promise<Tag[]> {
  const { results } = await db
    .prepare('SELECT id, display_name FROM tags ORDER BY display_name')
    .all<{ id: string; display_name: string }>()
  return sortTags(results.map((row) => ({ id: row.id, displayName: row.display_name })))
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
