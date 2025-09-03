export type GroupData = {
  label: string
  items: string[]
}

export type Recipe = {
  id: string
  userId: string
  title: string
  ingredients: GroupData[]
  instructions: string[]
  tags: Tag[]
  archived?: boolean
  totalTime: string | null
  yield: string | null
  createdAt: Date
  updatedAt: Date
}

export type Tag = {
  id: string
  displayName: string
}

export type SortOption = 'random' | 'title-asc' | 'title-desc' | 'updated-asc' | 'updated-desc'

export type UserConfig = {
  name: string
  theme: string
  language: string
  defaultSort?: SortOption
  defaultLayout?: 'grid' | 'list'
  defaultGridCols?: number
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
