import EditRecipeView from '../../edit-recipe-view'
import fs from 'fs'
import path from 'path'
import { serverDataPath } from '@/lib/utils'
import type { DatabaseSchema } from '@/lib/types'

type RecipePageProps = {
  params: Promise<{ recipe_id: string }>
  searchParams: Promise<{ mode: 'raw' | 'form' }>
}

// this is needed for static exports
export async function generateStaticParams() {
  console.log('Generating static params by reading local JSON file...')

  const filePath = path.join(process.cwd(), serverDataPath)

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const allData: DatabaseSchema = JSON.parse(fileContent)

    console.log(`Successfully read ${allData.recipes.length} recipes from local file.`)

    return allData.recipes.map((recipe) => ({
      recipe_id: recipe.id,
    }))
  } catch (error) {
    console.error('Error reading or parsing data.json:', error)
    return []
  }
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { recipe_id } = await params

  return <EditRecipeView recipeId={recipe_id} />
}
