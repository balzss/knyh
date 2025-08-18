import { NextRequest, NextResponse } from 'next/server'
import { getShoppingList, updateShoppingList } from '@/lib/database'
import type { ShoppingListItem } from '@/lib/types'

export async function GET() {
  try {
    const items = getShoppingList()
    return NextResponse.json(items)
  } catch (error) {
    console.error('Failed to get shopping list:', error)
    return NextResponse.json({ message: 'Failed to get shopping list' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const items: ShoppingListItem[] = await request.json()
    updateShoppingList(items)
    return NextResponse.json({ message: 'Shopping list updated successfully' })
  } catch (error) {
    console.error('Failed to update shopping list:', error)
    return NextResponse.json({ message: 'Failed to update shopping list' }, { status: 500 })
  }
}
