import { NextResponse } from 'next/server'
import { createRecipe, updateRecipe, getAllRecipes } from '@/lib/database'
import type { Recipe } from '@/lib/types'

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

    const newRecipes: Recipe[] = []
    for (const recipeData of payload) {
      const newRecipe = createRecipe(recipeData)
      newRecipes.push(newRecipe)
    }

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

    const updatedRecipes: Recipe[] = []
    for (const id of ids) {
      const updatedRecipe = updateRecipe(id, data)
      if (updatedRecipe) {
        updatedRecipes.push(updatedRecipe)
      }
    }

    return NextResponse.json(updatedRecipes, { status: 200 })
  } catch (error) {
    console.error(error)
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
