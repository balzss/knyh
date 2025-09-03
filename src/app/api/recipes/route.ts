import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getAllRecipes, createMultipleRecipes, updateRecipe, getRecipeById } from '@/lib/database'
import type { Recipe } from '@/lib/types'

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

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

    // Add userId to each recipe
    const recipesWithUserId = payload.map((recipeData: Recipe) => ({
      ...recipeData,
      userId: session.user.id,
    }))

    const newRecipes = await createMultipleRecipes(recipesWithUserId)
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
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
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
      const existing = await getRecipeById(id)
      if (!existing) continue
      // Only allow updating recipes owned by the session user
      if (existing.userId !== session.user.id) continue

      const updatedRecipe = await updateRecipe(id, data)
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

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const archivedParam = searchParams.get('archived')
    const archived = archivedParam !== null ? archivedParam === 'true' : undefined

    const recipes = await getAllRecipes(session.user.id, archived)
    return NextResponse.json(recipes)
  } catch (error) {
    console.error('Failed to export data:', error)
    return NextResponse.json({ message: 'Failed to load data' }, { status: 500 })
  }
}
