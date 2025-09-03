import { NextRequest, NextResponse } from 'next/server'
import { getUserConfig, updateUserConfig } from '@/lib/database'
import type { UserConfig } from '@/lib/types'

export async function GET() {
  const config = await getUserConfig()
  return NextResponse.json(config)
}

export async function PATCH(req: NextRequest) {
  const payload: Partial<UserConfig> = await req.json()
  if (!payload) {
    return NextResponse.json(
      { message: 'Cannot update config with empty payload.' },
      { status: 400 }
    )
  }

  const updatedConfig = await updateUserConfig(payload)
  return NextResponse.json(updatedConfig)
}
