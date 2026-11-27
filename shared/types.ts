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
  /** Tips, substitutions and anything else worth remembering, one per entry */
  notes: string[]
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
  'title' | 'ingredients' | 'instructions' | 'notes' | 'tags' | 'totalTime' | 'yield' | 'status'
>

export type Tag = {
  id: string
  displayName: string
}

// SQLite's NOCASE only folds ASCII, so accented names (á, é, ő) would sort after z
const tagCollator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true })

/** Tags in display order: alphabetical, ignoring case and accents. Returns a new array. */
export const sortTags = (tags: Tag[]): Tag[] =>
  [...tags].sort((a, b) => tagCollator.compare(a.displayName, b.displayName))

export type SortOption = 'random' | 'title-asc' | 'title-desc' | 'updated-asc' | 'updated-desc'

export type UserConfig = {
  name: string
  language: string
}

export type ShoppingListItem = {
  text: string
  checked: boolean
}

/** A recipe worth developing someday. The list is ordered by priority, first is next. */
export type Idea = {
  id: string
  title: string
  /** Things to try, things to keep in mind, source URLs. They become the recipe's notes. */
  notes: string[]
  createdAt: string
}

/** Router state on the editor page of a recipe that was just made from an idea. Lets Close undo it. */
export type FromIdeaState = { fromIdea: { idea: Idea; index: number } }

export type DatabaseSchema = {
  recipes: Recipe[]
  tags: Tag[]
  userConfig: UserConfig
  shoppingList: ShoppingListItem[]
  ideas: Idea[]
}
