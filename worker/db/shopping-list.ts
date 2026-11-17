import type { ShoppingListItem } from '../../shared/types'

export async function getShoppingList(db: D1Database): Promise<ShoppingListItem[]> {
  const { results } = await db
    .prepare('SELECT text, checked FROM shopping_list ORDER BY position')
    .all<{ text: string; checked: number }>()
  return results.map((row) => ({ text: row.text, checked: Boolean(row.checked) }))
}

export function shoppingListStatements(
  db: D1Database,
  items: ShoppingListItem[]
): D1PreparedStatement[] {
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
