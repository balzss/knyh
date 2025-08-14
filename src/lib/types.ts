export type GroupData = {
  label: string
  items: string[]
}

export type RecipeMetaData = {
  totalTime: string
  yield: string
}
export type Recipe = {
  id: string
  title: string
  ingredients: GroupData[]
  instructions: string[]
  tags: string[]
  metadata: RecipeMetaData
  archived?: boolean
  createdAt: string
  lastModified: string
}

export type Tag = {
  id: string
  displayName: string
}

export type UserConfig = {
  userId: string
  theme: 'light' | 'dark'
  language: string
}

export type DatabaseSchema = {
  recipes: Recipe[]
  tags: Tag[]
  userConfig: UserConfig
}
