import { NextRequest, NextResponse } from 'next/server'
import { getGroceryItemById, updateGroceryItem, deleteGroceryItem } from '@/lib/database'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const item = getGroceryItemById(id)

    if (!item) {
      return NextResponse.json({ message: 'Grocery item not found' }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Failed to get grocery item:', error)
    return NextResponse.json({ message: 'Failed to get grocery item' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const updates = await request.json()

    const updatedItem = updateGroceryItem(id, updates)

    if (!updatedItem) {
      return NextResponse.json({ message: 'Grocery item not found' }, { status: 404 })
    }

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Failed to update grocery item:', error)
    return NextResponse.json({ message: 'Failed to update grocery item' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const success = deleteGroceryItem(id)

    if (!success) {
      return NextResponse.json({ message: 'Grocery item not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Grocery item deleted successfully' })
  } catch (error) {
    console.error('Failed to delete grocery item:', error)
    return NextResponse.json({ message: 'Failed to delete grocery item' }, { status: 500 })
  }
}
