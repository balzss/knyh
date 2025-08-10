import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { generateId, serverDataPath } from '@/lib/utils'
import type { DatabaseSchema } from '@/lib/types'

const dataFilePath = path.join(process.cwd(), serverDataPath)

async function getAllData(): Promise<DatabaseSchema> {
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

    const allData = await getAllData()

    const newRecipes = payload.map((recipeData) => ({
      id: generateId(),
      ...recipeData,
    }))

    const updatedRecipes = [...allData.recipes, ...newRecipes]
    const updatedData: DatabaseSchema = { ...allData, recipes: updatedRecipes }
    await fs.writeFile(dataFilePath, JSON.stringify(updatedData, null, 2))

    return NextResponse.json(newRecipes, { status: 201 })
  } catch (error) {
    console.error(error)
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { ids, data } = await request.json()

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { message: 'Recipe IDs must be a non-empty array.' },
        { status: 400 }
      )
    }

    if (!data || typeof data !== 'object') {
      return NextResponse.json({ message: 'Update data must be an object.' }, { status: 400 })
    }

    const allData = await getAllData()

    const updatedRecipes = allData.recipes.map((recipe) => {
      if (ids.includes(recipe.id)) {
        return { ...recipe, ...data }
      }
      return recipe
    })

    const updatedData: DatabaseSchema = { ...allData, recipes: updatedRecipes }
    await fs.writeFile(dataFilePath, JSON.stringify(updatedData, null, 2))

    return NextResponse.json(
      updatedRecipes.filter((r) => ids.includes(r.id)),
      { status: 200 }
    )
  } catch (error) {
    console.error(error)
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
