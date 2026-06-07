// src/app/api/stats/route.ts
import { NextResponse } from 'next/server'
import { getGlobalStats } from '@/lib/db'

export const revalidate = 3600 // 1h

export async function GET() {
  try {
    const stats = await getGlobalStats()
    return NextResponse.json({ data: stats }, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
