import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { serverDataPath } from '@/lib/utils'
import type { DatabaseSchema, Tag } from '@/lib/types'

const dataFilePath = path.join(process.cwd(), serverDataPath)

async function getAllData(): Promise<DatabaseSchema> {
  const fileContents = await fs.readFile(dataFilePath, 'utf8')
  return JSON.parse(fileContents)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const { displayName }: { displayName: string } = await request.json()
    if (!displayName || typeof displayName !== 'string') {
      return NextResponse.json({ message: 'displayName required' }, { status: 400 })
    }
    const trimmed = displayName.trim()
    const allData = await getAllData()
    const existing = allData.tags.find((t) => t.id === id)
    if (!existing) {
      return NextResponse.json({ message: 'Tag not found' }, { status: 404 })
    }
    if (
      allData.tags.some((t) => t.id !== id && t.displayName.toLowerCase() === trimmed.toLowerCase())
    ) {
      return NextResponse.json({ message: 'Tag name already exists' }, { status: 409 })
    }
    const updatedTags: Tag[] = allData.tags.map((t) =>
      t.id === id ? { ...t, displayName: trimmed } : t
    )
    const updatedData: DatabaseSchema = { ...allData, tags: updatedTags }
    await fs.writeFile(dataFilePath, JSON.stringify(updatedData, null, 2))
    return NextResponse.json(
      updatedTags.find((t) => t.id === id),
      { status: 200 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const allData = await getAllData()
    const tagExists = allData.tags.some((t) => t.id === id)
    if (!tagExists) {
      return NextResponse.json({ message: 'Tag not found' }, { status: 404 })
    }
    const updatedTags = allData.tags.filter((t) => t.id !== id)
    const updatedRecipes = allData.recipes.map((r) => ({
      ...r,
      tags: r.tags.filter((tagId) => tagId !== id),
    }))
    const updatedData: DatabaseSchema = { ...allData, tags: updatedTags, recipes: updatedRecipes }
    await fs.writeFile(dataFilePath, JSON.stringify(updatedData, null, 2))
    return NextResponse.json({ message: 'Tag deleted' }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
