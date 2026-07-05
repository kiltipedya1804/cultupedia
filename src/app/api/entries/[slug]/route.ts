// src/app/api/entries/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getEntryBySlug, updateEntry, deleteEntry, sql } from '@/lib/db'
import { cookies } from 'next/headers'
import { getUserById } from '@/lib/auth'
import { z } from 'zod'

async function getCurrentUser() {
  const token = cookies().get('auth_token')?.value
  if (!token) return null
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [id] = decoded.split(':')
    return await getUserById(id)
  } catch { return null }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const entry = await getEntryBySlug(params.slug)
    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }
    return NextResponse.json({ data: entry }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Auth check — admin or contributor
    const apiKey = req.headers.get('x-api-key')
    const user = await getCurrentUser()

    if (apiKey !== process.env.ADMIN_API_KEY && !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const existing = await getEntryBySlug(params.slug)
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json()

    // Update standard fields
    const standardFields: Record<string, any> = {}
    const allowed = ['nom', 'type', 'sous_discipline', 'annee', 'statut', 'ville', 'pays',
      'region', 'responsable', 'institution', 'studio', 'description', 'tag', 'lien',
      'rubrique', 'image_url', 'featured', 'verified',
      'nom_ht', 'nom_en', 'description_ht', 'description_en',
      'latitude', 'longitude']

    for (const key of allowed) {
      if (key in body) standardFields[key] = body[key]
    }

    if (Object.keys(standardFields).length > 0) {
      await updateEntry(existing.id, standardFields)
    }

    // Update JSONB fields separately
    if ('images' in body) {
      await sql`UPDATE entries SET images = ${JSON.stringify(body.images)}::jsonb WHERE id = ${existing.id}`
    }
    if ('videos' in body) {
      await sql`UPDATE entries SET videos = ${JSON.stringify(body.videos)}::jsonb WHERE id = ${existing.id}`
    }
    if ('audios' in body) {
      await sql`UPDATE entries SET audios = ${JSON.stringify(body.audios)}::jsonb WHERE id = ${existing.id}`
    }
    if ('timeline' in body) {
      await sql`UPDATE entries SET timeline = ${JSON.stringify(body.timeline)}::jsonb WHERE id = ${existing.id}`
    }
    if ('sources' in body) {
      await sql`UPDATE entries SET sources = ${JSON.stringify(body.sources)}::jsonb WHERE id = ${existing.id}`
    }

    // Recalculate completude
    await sql`UPDATE entries SET completude = compute_completude(entries.*) WHERE id = ${existing.id}`

    const updated = await getEntryBySlug(params.slug)
    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const apiKey = req.headers.get('x-api-key')
    if (apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existing = await getEntryBySlug(params.slug)
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await deleteEntry(existing.id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
