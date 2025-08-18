import { NextResponse } from 'next/server'
import { getRecipeById, updateRecipe, deleteRecipe } from '@/lib/database'
import type { Recipe, DatabaseSchema } from '@/lib/types'
import fs from 'fs'
import path from 'path'
import { serverDataPath } from '@/lib/utils'

export const dynamic = 'force-static'

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

  try {
    const updatedRecipeData: Omit<Recipe, 'id'> = await request.json()

    const existingRecipe = getRecipeById(id)
    if (!existingRecipe) {
      return NextResponse.json({ message: 'Recipe not found' }, { status: 404 })
    }

    // Update the recipe while preserving createdAt
    const updatedRecipe = updateRecipe(id, {
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

  try {
    const recipeExists = getRecipeById(id)
    if (!recipeExists) {
      return NextResponse.json({ message: 'Recipe not found' }, { status: 404 })
    }

    const success = deleteRecipe(id)
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

    if (ids && Array.isArray(ids) && ids.length > 0) {
      // Handle multiple recipe updates
      const updatedRecipes: Recipe[] = []
      for (const recipeId of ids) {
        const updatedRecipe = updateRecipe(recipeId, { archived })
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
      const existingRecipe = getRecipeById(id)
      if (!existingRecipe) {
        return NextResponse.json({ message: 'Recipe not found' }, { status: 404 })
      }

      const updatedRecipe = updateRecipe(id, { archived })
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
