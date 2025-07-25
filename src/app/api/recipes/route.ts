import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { Recipe } from '@/lib/types'
import { generateId } from '@/lib/utils'

// Define the path to your data file
const dataFilePath = path.join(process.cwd(), 'public/data/recipes.json')

async function getRecipes(): Promise<Recipe[]> {
  const fileContents = await fs.readFile(dataFilePath, 'utf8')
  return JSON.parse(fileContents)
}

export async function POST(request: Request) {
  try {
    const newRecipeData = await request.json()
    const allRecipes = await getRecipes()

    // Generate a unique ID for the new recipe
    const newRecipe: Recipe = {
      id: generateId(),
      ...newRecipeData,
    }

    // Add the new recipe to the list
    allRecipes.push(newRecipe)

    // Write the updated list back to the file
    await fs.writeFile(dataFilePath, JSON.stringify(allRecipes, null, 2))

    // Return the newly created recipe with a 201 status code
    return NextResponse.json(newRecipe, { status: 201 })
  } catch (error) {
    console.error(error)
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
