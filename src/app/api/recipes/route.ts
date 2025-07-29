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
    const payload = await request.json()

    // Enforce the array contract
    if (!Array.isArray(payload)) {
      return NextResponse.json(
        { message: 'Request body must be an array of recipe objects.' },
        { status: 400 }
      )
    }

    // Reject empty arrays as a bad request
    if (payload.length === 0) {
      return NextResponse.json(
        { message: 'Cannot create recipes from an empty array.' },
        { status: 400 }
      )
    }

    const allRecipes = await getRecipes()

    const newRecipes = payload.map((recipeData) => ({
      id: generateId(),
      ...recipeData,
    }))

    const updatedRecipes = [...allRecipes, ...newRecipes]
    await fs.writeFile(dataFilePath, JSON.stringify(updatedRecipes, null, 2))

    return NextResponse.json(newRecipes, { status: 201 })
  } catch (error) {
    console.error(error)
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
