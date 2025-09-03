import { NextResponse } from 'next/server'
import {
  getTagById,
  updateTag,
  deleteTag,
  getAllTags,
  getAllRecipes,
  updateRecipe,
} from '@/lib/database'
import fs from 'fs'
import path from 'path'
import { serverDataPath } from '@/lib/utils'
import type { DatabaseSchema } from '@/lib/types'

// Generate static params for all existing tags
export async function generateStaticParams() {
  try {
    const filePath = path.join(process.cwd(), serverDataPath)
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const allData: DatabaseSchema = JSON.parse(fileContent)

    return allData.tags.map((tag) => ({
      id: tag.id,
    }))
  } catch (error) {
    console.error('Error reading tags for static params:', error)
    return []
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const { displayName }: { displayName: string } = await request.json()
    if (!displayName || typeof displayName !== 'string') {
      return NextResponse.json({ message: 'displayName required' }, { status: 400 })
    }
    const trimmed = displayName.trim()

    const existing = await getTagById(id)
    if (!existing) {
      return NextResponse.json({ message: 'Tag not found' }, { status: 404 })
    }
    const allTags = await getAllTags()
    if (allTags.some((t) => t.id !== id && t.displayName.toLowerCase() === trimmed.toLowerCase())) {
      return NextResponse.json({ message: 'Tag name already exists' }, { status: 409 })
    }
    const updatedTag = await updateTag(id, { displayName: trimmed })
    if (!updatedTag) {
      return NextResponse.json({ message: 'Failed to update tag' }, { status: 500 })
    }

    return NextResponse.json(updatedTag, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const tagExists = await getTagById(id)
    if (!tagExists) {
      return NextResponse.json({ message: 'Tag not found' }, { status: 404 })
    }
    // Remove tag from all recipes that use it
    const allRecipes = await getAllRecipes()
    for (const recipe of allRecipes) {
      if (recipe.tags.some((tag) => tag.id === id)) {
        const updatedTags = recipe.tags.filter((tag) => tag.id !== id)
        await updateRecipe(recipe.id, { tags: updatedTags })
      }
    }

    // Delete the tag
    const success = await deleteTag(id)
    if (!success) {
      return NextResponse.json({ message: 'Failed to delete tag' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Tag deleted' }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
