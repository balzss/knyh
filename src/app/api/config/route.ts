import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { serverDataPath } from '@/lib/utils'
import type { DatabaseSchema, UserConfig } from '@/lib/types'

const dataFilePath = path.join(process.cwd(), serverDataPath)

async function getAllData(): Promise<DatabaseSchema> {
  const fileContents = await fs.readFile(dataFilePath, 'utf8')
  return JSON.parse(fileContents)
}

async function writeData(updatedConfig: Partial<UserConfig>) {
  const allData = await getAllData()
  const updatedData: DatabaseSchema = {
    ...allData,
    userConfig: { ...allData.userConfig, ...updatedConfig },
  }
  await fs.writeFile(dataFilePath, JSON.stringify(updatedData, null, 2))
}

export async function GET() {
  const data = await getAllData()
  return NextResponse.json(data.userConfig)
}

export async function PATCH(req: NextRequest) {
  const payload: Partial<UserConfig> = await req.json()
  if (!payload) {
    return NextResponse.json(
      { message: 'Cannot create recipes from an empty array.' },
      { status: 400 }
    )
  }

  await writeData(payload)

  return NextResponse.json(payload)
}
