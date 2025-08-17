import { NextResponse } from 'next/server'
import { getTagById, updateTag, deleteTag, getAllTags, getAllRecipes, updateRecipe } from '@/lib/database'
import type { Tag } from '@/lib/types'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const { displayName }: { displayName: string } = await request.json()
    if (!displayName || typeof displayName !== 'string') {
      return NextResponse.json({ message: 'displayName required' }, { status: 400 })
    }
    const trimmed = displayName.trim()
    
    const existing = getTagById(id)
    if (!existing) {
      return NextResponse.json({ message: 'Tag not found' }, { status: 404 })
    }
    
    const allTags = getAllTags()
    if (allTags.some((t) => t.id !== id && t.displayName.toLowerCase() === trimmed.toLowerCase())) {
      return NextResponse.json({ message: 'Tag name already exists' }, { status: 409 })
    }
    
    const updatedTag = updateTag(id, { displayName: trimmed })
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
    const tagExists = getTagById(id)
    if (!tagExists) {
      return NextResponse.json({ message: 'Tag not found' }, { status: 404 })
    }
    
    // Remove tag from all recipes that use it
    const allRecipes = getAllRecipes()
    for (const recipe of allRecipes) {
      if (recipe.tags.includes(id)) {
        const updatedTags = recipe.tags.filter((tagId) => tagId !== id)
        updateRecipe(recipe.id, { tags: updatedTags })
      }
    }
    
    // Delete the tag
    const success = deleteTag(id)
    if (!success) {
      return NextResponse.json({ message: 'Failed to delete tag' }, { status: 500 })
    }
    
    return NextResponse.json({ message: 'Tag deleted' }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
