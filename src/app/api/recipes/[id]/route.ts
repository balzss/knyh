import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { Recipe } from '@/lib/types'

const dataFilePath = path.join(process.cwd(), 'public/data/recipes.json')

async function getRecipes(): Promise<Recipe[]> {
  const fileContents = await fs.readFile(dataFilePath, 'utf8')
  return JSON.parse(fileContents)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const updatedRecipeData: Omit<Recipe, 'id'> = await request.json()
    const allRecipes = await getRecipes()

    const recipeIndex = allRecipes.findIndex((recipe) => recipe.id === id)

    if (recipeIndex === -1) {
      return NextResponse.json({ message: 'Recipe not found' }, { status: 404 })
    }

    // Create the updated recipe, ensuring the ID from the URL is preserved.
    const updatedRecipe: Recipe = {
      ...updatedRecipeData,
      id: id,
    }

    // Replace the old recipe with the new one.
    allRecipes[recipeIndex] = updatedRecipe

    // Write the entire updated array back to the file.
    await fs.writeFile(dataFilePath, JSON.stringify(allRecipes, null, 2))

    return NextResponse.json(updatedRecipe, { status: 200 })
  } catch (error) {
    console.error(error)
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const allRecipes = await getRecipes()

    const recipeExists = allRecipes.some((recipe) => recipe.id === id)
    if (!recipeExists) {
      return NextResponse.json({ message: 'Recipe not found' }, { status: 404 })
    }

    // Filter out the recipe to be deleted
    const updatedRecipes = allRecipes.filter((recipe) => recipe.id !== id)

    // Write the new array back to the file
    await fs.writeFile(dataFilePath, JSON.stringify(updatedRecipes, null, 2))

    return NextResponse.json({ message: 'Recipe deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
