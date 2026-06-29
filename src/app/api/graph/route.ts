// src/app/api/graph/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''
    const limit = Math.min(parseInt(searchParams.get('limit') || '80'), 150)

    // Get nodes
    const nodes = q
      ? await sql`
          SELECT DISTINCT e.id, e.slug, e.nom, e.type, e.discipline,
            e.ville, e.views, e.featured,
            ec.category
          FROM entries e
          LEFT JOIN entry_categories ec ON ec.entry_id = e.id AND ec.is_primary = TRUE
          WHERE e.nom ILIKE ${'%' + q + '%'}
             OR e.ville ILIKE ${'%' + q + '%'}
             OR e.type ILIKE ${'%' + q + '%'}
          LIMIT ${limit}`
      : await sql`
          SELECT DISTINCT e.id, e.slug, e.nom, e.type, e.discipline,
            e.ville, e.views, e.featured,
            ec.category
          FROM entries e
          LEFT JOIN entry_categories ec ON ec.entry_id = e.id AND ec.is_primary = TRUE
          WHERE e.featured = TRUE OR e.views > 5
          ORDER BY e.featured DESC, e.views DESC
          LIMIT ${limit}`

    const nodeIds = nodes.map((n: any) => n.id)

    if (nodeIds.length === 0) {
      return NextResponse.json({ nodes: [], links: [] })
    }

    // Get links between those nodes only
    const links = await sql`
      SELECT er.entry_id AS source, er.related_id AS target, er.relation_type
      FROM entry_relations er
      WHERE er.entry_id = ANY(${nodeIds}::int[])
        AND er.related_id = ANY(${nodeIds}::int[])
      LIMIT 500
    `

    return NextResponse.json({
      nodes,
      links: links.map((l: any) => ({
        source: l.source,
        target: l.target,
        relation_type: l.relation_type,
      }))
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60' }
    })
  } catch (error) {
    console.error('Graph error:', error)
    return NextResponse.json({ nodes: [], links: [] }, { status: 500 })
  }
}
