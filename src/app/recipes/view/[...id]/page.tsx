import RecipeView from '../../recipe-view'
import fs from 'fs'
import path from 'path'
import { serverDataPath } from '@/lib/utils'
import type { DatabaseSchema } from '@/lib/types'

type RecipePageProps = {
  params: Promise<{ id: string[] }>
}

// Generate static params for existing recipes only
// For localStorage recipes, they'll be handled client-side
export async function generateStaticParams() {
  console.log('Generating static params for catch-all recipe view...')

  try {
    const filePath = path.join(process.cwd(), serverDataPath)
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const allData: DatabaseSchema = JSON.parse(fileContent)

    console.log(`Successfully read ${allData.recipes.length} recipes from local file.`)

    return allData.recipes.map((recipe) => ({
      id: [recipe.id],
    }))
  } catch (error) {
    console.error('Error reading or parsing data.json:', error)
    return []
  }
}

export default async function RecipeViewPage({ params }: RecipePageProps) {
  const paramsValue = await params
  const recipeId = paramsValue.id[0] // Get the first segment as the recipe ID

  return <RecipeView recipeId={recipeId} />
}
