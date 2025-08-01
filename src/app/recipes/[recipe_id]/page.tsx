import RecipeView from './recipe-view'
import fs from 'fs'
import path from 'path'
import type { Recipe } from '@/lib/types'

type RecipePageProps = {
  params: Promise<{ recipe_id: string }>
}

// this is needed for static exports
export async function generateStaticParams() {
  console.log('Generating static params by reading local JSON file...')

  const filePath = path.join(process.cwd(), 'public', 'data', 'recipes.json')

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const recipes: Recipe[] = JSON.parse(fileContent)

    console.log(`Successfully read ${recipes.length} recipes from local file.`)

    return recipes.map((recipe) => ({
      recipe_id: recipe.id,
    }))
  } catch (error) {
    console.error('Error reading or parsing recipes.json:', error)
    return []
  }
}

export default async function RecipePage({ params }: RecipePageProps) {
  const paramsValue = await params
  const recipeId = paramsValue.recipe_id

  return <RecipeView recipeId={recipeId} />
}
