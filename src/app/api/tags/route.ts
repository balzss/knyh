import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { generateId, serverDataPath } from '@/lib/utils'
import type { DatabaseSchema, Tag } from '@/lib/types'

const dataFilePath = path.join(process.cwd(), serverDataPath)

async function getAllData(): Promise<DatabaseSchema> {
  const fileContents = await fs.readFile(dataFilePath, 'utf8')
  return JSON.parse(fileContents)
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()

    const payloadArray = Array.isArray(payload) ? payload : [payload]

    if (payloadArray.length === 0) {
      return NextResponse.json({ message: 'Cannot create from empty array.' }, { status: 400 })
    }

    const allData = await getAllData()

    const existingNames = new Set(allData.tags.map((t) => t.displayName.toLowerCase()))

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
      newTags.push({ id: generateId(), displayName: name })
      existingNames.add(name.toLowerCase())
    }

    const updatedData: DatabaseSchema = { ...allData, tags: [...allData.tags, ...newTags] }
    await fs.writeFile(dataFilePath, JSON.stringify(updatedData, null, 2))

    return NextResponse.json(Array.isArray(payload) ? newTags : newTags[0], { status: 201 })
  } catch (error) {
    console.error(error)
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
