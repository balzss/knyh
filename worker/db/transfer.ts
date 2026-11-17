import type { DatabaseSchema } from '../../shared/types'
import { toIso } from './util'
import { insertRecipeStatements, listRecipes } from './recipes'
import { listTags } from './tags'
import { configStatements, getConfig } from './config'
import { getShoppingList, shoppingListStatements } from './shopping-list'
import { ideaStatements, listIdeas } from './ideas'

export async function exportAll(db: D1Database): Promise<DatabaseSchema> {
  const [recipes, tags, userConfig, shoppingList, ideas] = await Promise.all([
    listRecipes(db),
    listTags(db),
    getConfig(db),
    getShoppingList(db),
    listIdeas(db),
  ])
  // The client types dates as Date, but they cross the wire as ISO strings.
  return {
    recipes: recipes as unknown as DatabaseSchema['recipes'],
    tags,
    userConfig,
    shoppingList,
    ideas,
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
    ...ideaStatements(db, data.ideas ?? []),
  ]
  await db.batch(statements)
}
