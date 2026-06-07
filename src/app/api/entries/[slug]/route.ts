// src/app/api/entries/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getEntryBySlug, updateEntry, deleteEntry } from '@/lib/db'
import { z } from 'zod'

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
    const apiKey = req.headers.get('x-api-key')
    if (apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existing = await getEntryBySlug(params.slug)
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json()
    const entry = await updateEntry(existing.id, body)
    return NextResponse.json({ data: entry })
  } catch {
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
