export type GroupData = {
  label: string
  items: string[]
}

export const RECIPE_STATUSES = ['development', 'ready'] as const
export type RecipeStatus = (typeof RECIPE_STATUSES)[number]

export type Recipe = {
  id: string
  title: string
  ingredients: GroupData[]
  instructions: string[]
  tags: Tag[]
  archived?: boolean
  status: RecipeStatus
  totalTime: string | null
  yield: string | null
  createdAt: Date
  updatedAt: Date
}

/** The part of a recipe the user edits. Carried between form and markdown mode. */
export type RecipeDraft = Pick<
  Recipe,
  'title' | 'ingredients' | 'instructions' | 'tags' | 'totalTime' | 'yield' | 'status'
>

export type Tag = {
  id: string
  displayName: string
}

export type SortOption = 'random' | 'title-asc' | 'title-desc' | 'updated-asc' | 'updated-desc'

export type UserConfig = {
  name: string
  language: string
}

export type ShoppingListItem = {
  text: string
  checked: boolean
}

export type DatabaseSchema = {
  recipes: Recipe[]
  tags: Tag[]
  userConfig: UserConfig
  shoppingList: ShoppingListItem[]
}
