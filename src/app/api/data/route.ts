import { NextResponse } from 'next/server'
import { exportToJson } from '@/lib/database'

export async function GET() {
  try {
    const data = exportToJson()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to export data:', error)
    return NextResponse.json(
      { message: 'Failed to load data' },
      { status: 500 }
    )
  }
}
