import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getRecipeById, updateRecipe, deleteRecipe } from '@/lib/database'
import type { Recipe, DatabaseSchema } from '@/lib/types'
import fs from 'fs'
import path from 'path'
import { serverDataPath } from '@/lib/utils'

// Generate static params for all existing recipes
export async function generateStaticParams() {
  try {
    const filePath = path.join(process.cwd(), serverDataPath)
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const allData: DatabaseSchema = JSON.parse(fileContent)

    return allData.recipes.map((recipe) => ({
      id: recipe.id,
    }))
  } catch (error) {
    console.error('Error reading recipes for static params:', error)
    return []
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  try {
    const updatedRecipeData: Omit<Recipe, 'id'> = await request.json()

    const existingRecipe = await getRecipeById(id)
    if (!existingRecipe) {
      return NextResponse.json({ message: 'Recipe not found' }, { status: 404 })
    }

    if (existingRecipe.userId !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    // Update the recipe while preserving createdAt
    const updatedRecipe = await updateRecipe(id, {
      ...updatedRecipeData,
      createdAt: existingRecipe.createdAt,
    })

    if (!updatedRecipe) {
      return NextResponse.json({ message: 'Failed to update recipe' }, { status: 500 })
    }

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
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  try {
    const recipeExists = await getRecipeById(id)
    if (!recipeExists) {
      return NextResponse.json({ message: 'Recipe not found' }, { status: 404 })
    }

    if (recipeExists.userId !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const success = await deleteRecipe(id)
    if (!success) {
      return NextResponse.json({ message: 'Failed to delete recipe' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Recipe deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const { archived, ids }: { archived: boolean; ids?: string[] } = await request.json()

    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (ids && Array.isArray(ids) && ids.length > 0) {
      // Handle multiple recipe updates
      const updatedRecipes: Recipe[] = []
      for (const recipeId of ids) {
        const existing = await getRecipeById(recipeId)
        if (!existing) continue
        if (existing.userId !== session.user.id) continue

        const updatedRecipe = await updateRecipe(recipeId, { archived })
        if (updatedRecipe) {
          updatedRecipes.push(updatedRecipe)
        }
      }
      return NextResponse.json(
        { message: 'Recipe(s) updated successfully', updatedRecipes },
        { status: 200 }
      )
    } else {
      // Handle single recipe update based on URL id
      const existingRecipe = await getRecipeById(id)
      if (!existingRecipe) {
        return NextResponse.json({ message: 'Recipe not found' }, { status: 404 })
      }

      if (existingRecipe.userId !== session.user.id) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
      }

      const updatedRecipe = await updateRecipe(id, { archived })
      if (!updatedRecipe) {
        return NextResponse.json({ message: 'Failed to update recipe' }, { status: 500 })
      }

      return NextResponse.json({ message: 'Recipe updated successfully' }, { status: 200 })
    }
  } catch (error) {
    console.error(error)
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
