import { NextResponse } from 'next/server'
import { createTag, getAllTags } from '@/lib/database'
import { generateId } from '@/lib/utils'
import type { Tag } from '@/lib/types'

export async function POST(request: Request) {
  try {
    const payload = await request.json()

    const payloadArray = Array.isArray(payload) ? payload : [payload]

    if (payloadArray.length === 0) {
      return NextResponse.json({ message: 'Cannot create from empty array.' }, { status: 400 })
    }

    const existingTags = getAllTags()
    const existingNames = new Set(existingTags.map((t) => t.displayName.toLowerCase()))

    const newTags: Tag[] = []
    for (const tagData of payloadArray) {
      if (!tagData || typeof tagData.displayName !== 'string') {
        return NextResponse.json(
          { message: 'Each tag must have a displayName string.' },
          { status: 400 }
        )
      }
      const name = tagData.displayName.trim()
      if (!name) {
        return NextResponse.json({ message: 'Tag displayName cannot be empty.' }, { status: 400 })
      }
      if (existingNames.has(name.toLowerCase())) {
        return NextResponse.json({ message: `Tag '${name}' already exists.` }, { status: 409 })
      }

      const newTag = createTag({ id: generateId(), displayName: name })
      newTags.push(newTag)
      existingNames.add(name.toLowerCase())
    }

    return NextResponse.json(Array.isArray(payload) ? newTags : newTags[0], { status: 201 })
  } catch (error) {
    console.error(error)
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
