import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { serverDataPath } from '@/lib/utils'
import type { Recipe, DatabaseSchema } from '@/lib/types'

const dataFilePath = path.join(process.cwd(), serverDataPath)

async function getAllData(): Promise<DatabaseSchema> {
  const fileContents = await fs.readFile(dataFilePath, 'utf8')
  return JSON.parse(fileContents)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const updatedRecipeData: Omit<Recipe, 'id'> = await request.json()
    const allData = await getAllData()

    const recipeIndex = allData.recipes.findIndex((recipe) => recipe.id === id)

    if (recipeIndex === -1) {
      return NextResponse.json({ message: 'Recipe not found' }, { status: 404 })
    }

    // Create the updated recipe, ensuring the ID from the URL is preserved.
    const updatedRecipe: Recipe = {
      ...updatedRecipeData,
      id: id,
    }

    // Replace the old recipe with the new one.
    const updatedRecipes = allData.recipes.map((prevRecipe, index) =>
      index === recipeIndex ? updatedRecipe : prevRecipe
    )
    const updatedData: DatabaseSchema = { ...allData, recipes: updatedRecipes }
    // Write the entire updated array back to the file.
    await fs.writeFile(dataFilePath, JSON.stringify(updatedData, null, 2))

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
    const allData = await getAllData()

    const recipeExists = allData.recipes.some((recipe) => recipe.id === id)
    if (!recipeExists) {
      return NextResponse.json({ message: 'Recipe not found' }, { status: 404 })
    }

    // Filter out the recipe to be deleted
    const updatedRecipes = allData.recipes.filter((recipe) => recipe.id !== id)
    const updatedData: DatabaseSchema = { ...allData, recipes: updatedRecipes }

    // Write the new array back to the file
    await fs.writeFile(dataFilePath, JSON.stringify(updatedData, null, 2))

    return NextResponse.json({ message: 'Recipe deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
