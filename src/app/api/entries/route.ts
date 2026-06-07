// src/app/api/entries/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { searchEntries, createEntry } from '@/lib/db'
import { z } from 'zod'
import type { SearchFilters } from '@/types'

const searchSchema = z.object({
  q:          z.string().optional(),
  discipline: z.string().optional(),
  region:     z.string().optional(),
  statut:     z.string().optional(),
  pays:       z.string().optional(),
  type:       z.string().optional(),
  sous_disc:  z.string().optional(),
  featured:   z.string().optional(),
  page:       z.string().optional(),
  limit:      z.string().optional(),
  sort:       z.string().optional(),
  order:      z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const params = Object.fromEntries(searchParams.entries())
    const validated = searchSchema.parse(params)

    const filters: SearchFilters = {
      q:          validated.q,
      discipline: validated.discipline as any,
      region:     validated.region as any,
      statut:     validated.statut as any,
      pays:       validated.pays,
      type:       validated.type,
      sous_disc:  validated.sous_disc,
      featured:   validated.featured === 'true' ? true : undefined,
      page:       validated.page ? parseInt(validated.page) : 1,
      limit:      validated.limit ? Math.min(parseInt(validated.limit), 100) : 24,
      sort:       validated.sort as any,
      order:      validated.order as any,
    }

    const result = await searchEntries(filters)

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}

const createSchema = z.object({
  nom:             z.string().min(1).max(500),
  type:            z.string().min(1),
  discipline:      z.enum(['musique','danse','cinema','graffiti','theatre','gastronomie','edition']),
  sous_discipline: z.string().default(''),
  annee:           z.string().optional(),
  statut:          z.enum(['en_cours','archive','en_projet','fermé']).default('en_cours'),
  ville:           z.string().default(''),
  pays:            z.string().default(''),
  region:          z.enum(['Caraïbes','Amérique du Nord','Amérique du Sud','Europe','Afrique','Asie','Océanie']),
  responsable:     z.string().optional(),
  institution:     z.string().optional(),
  studio:          z.string().optional(),
  description:     z.string().default(''),
  reference:       z.string().optional(),
  tag:             z.string().optional(),
  lien:            z.string().optional(),
  rubrique:        z.string().optional(),
  image_url:       z.string().optional(),
  featured:        z.boolean().default(false),
})

export async function POST(req: NextRequest) {
  try {
    // Vérifier auth admin (simple API key)
    const apiKey = req.headers.get('x-api-key')
    if (apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const data = createSchema.parse(body)
    const entry = await createEntry(data as any)

    return NextResponse.json({ data: entry }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}
