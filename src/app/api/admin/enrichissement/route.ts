// src/app/api/admin/enrichissement/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { cookies } from 'next/headers'
import { getUserById } from '@/lib/auth'

async function checkAdmin() {
  const token = cookies().get('auth_token')?.value
  if (!token) return false
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [id] = decoded.split(':')
    const user = await getUserById(id)
    return user?.role === 'admin' || user?.role === 'moderator'
  } catch { return false }
}

export async function GET(req: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const filter = searchParams.get('filter') ?? 'incomplete'
  const q = searchParams.get('q') ?? ''
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200)

  let entries

  if (filter === 'no_image') {
    entries = await sql`
      SELECT id, slug, nom, type, discipline, description, image_url,
        ville, pays, latitude, longitude, completude, verified, lien, annee, institution
      FROM entries
      WHERE (image_url IS NULL OR image_url = '' OR image_url = '—')
        ${q ? sql`AND nom ILIKE ${'%' + q + '%'}` : sql``}
      ORDER BY completude ASC, views DESC
      LIMIT ${limit}
    `
  } else if (filter === 'no_geo') {
    entries = await sql`
      SELECT id, slug, nom, type, discipline, description, image_url,
        ville, pays, latitude, longitude, completude, verified, lien, annee, institution
      FROM entries
      WHERE latitude IS NULL
        ${q ? sql`AND nom ILIKE ${'%' + q + '%'}` : sql``}
      ORDER BY completude ASC, views DESC
      LIMIT ${limit}
    `
  } else if (filter === 'all') {
    entries = await sql`
      SELECT id, slug, nom, type, discipline, description, image_url,
        ville, pays, latitude, longitude, completude, verified, lien, annee, institution
      FROM entries
      WHERE TRUE
        ${q ? sql`AND nom ILIKE ${'%' + q + '%'}` : sql``}
      ORDER BY completude ASC
      LIMIT ${limit}
    `
  } else {
    // incomplete - completude < 70
    entries = await sql`
      SELECT id, slug, nom, type, discipline, description, image_url,
        ville, pays, latitude, longitude, completude, verified, lien, annee, institution
      FROM entries
      WHERE completude < 70
        ${q ? sql`AND nom ILIKE ${'%' + q + '%'}` : sql``}
      ORDER BY completude ASC, views DESC
      LIMIT ${limit}
    `
  }

  return NextResponse.json({ entries, total: entries.length })
}
