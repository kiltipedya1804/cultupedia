// src/app/api/map/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') || ''
    const q = searchParams.get('q') || ''

    const rows = await sql`
      SELECT 
        e.id, e.slug, e.nom, e.type, e.discipline,
        e.ville, e.pays, e.image_url,
        e.latitude, e.longitude,
        e.description,
        ec.category
      FROM entries e
      LEFT JOIN entry_categories ec ON ec.entry_id = e.id AND ec.is_primary = TRUE
      WHERE e.latitude IS NOT NULL 
        AND e.longitude IS NOT NULL
        ${category ? sql`AND ec.category = ${category}` : sql``}
        ${q ? sql`AND e.nom ILIKE ${'%' + q + '%'}` : sql``}
      LIMIT 2000
    `

    return NextResponse.json({ points: rows }, {
      headers: { 'Cache-Control': 'public, s-maxage=300' }
    })
  } catch (error) {
    console.error('Map error:', error)
    return NextResponse.json({ points: [] }, { status: 500 })
  }
}
