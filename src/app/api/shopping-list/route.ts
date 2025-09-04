import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getShoppingList, updateShoppingList } from '@/lib/database'
import type { ShoppingListItem } from '@/lib/types'

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const items = await getShoppingList(session.user.id)
    return NextResponse.json(items)
  } catch (error) {
    console.error('Failed to get shopping list:', error)
    return NextResponse.json({ message: 'Failed to get shopping list' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const items: ShoppingListItem[] = body.items || body // Support both {items: [...]} and direct array

    await updateShoppingList(session.user.id, items)
    return NextResponse.json({ message: 'Shopping list updated successfully' })
  } catch (error) {
    console.error('Failed to update shopping list:', error)
    return NextResponse.json({ message: 'Failed to update shopping list' }, { status: 500 })
  }
}
