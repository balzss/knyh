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
  ingredients: string[] | GroupData[]
  instructions: string[]
  tags: string[]
  metadata: RecipeMetaData
}

export type Tag = {
  id: string
  displayName: string
}
