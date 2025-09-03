import { NextResponse } from 'next/server'
import { importFromJson } from '@/lib/database'
import {
  isValidDatabaseSchema,
  normalizeImportData,
  validateUniqueIds,
} from '@/lib/import-validation'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate basic schema structure
    if (!isValidDatabaseSchema(body)) {
      return NextResponse.json(
        { message: 'Invalid data format - please check your JSON structure' },
        { status: 400 }
      )
    }

    // Normalize data to current schema format
    const normalizedData = normalizeImportData(body)

    // Validate ID uniqueness
    const uniqueCheck = validateUniqueIds(normalizedData)
    if (!uniqueCheck.valid) {
      return NextResponse.json({ message: uniqueCheck.error }, { status: 400 })
    }

    // Import into database
    await importFromJson(normalizedData)

    return NextResponse.json(
      {
        message: 'Import successful',
        imported: {
          recipes: normalizedData.recipes.length,
          tags: normalizedData.tags.length,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Import failed:', error)

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { message: 'Invalid JSON format - please check your file' },
        { status: 400 }
      )
    }

    return NextResponse.json({ message: 'Internal server error during import' }, { status: 500 })
  }
}
