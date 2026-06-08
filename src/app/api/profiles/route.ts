// src/app/api/profiles/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createProfile, searchProfiles } from '@/lib/db'
import { cookies } from 'next/headers'
import { getUserById } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q          = searchParams.get('q') || undefined
    const type       = searchParams.get('type') || undefined
    const discipline = searchParams.get('discipline') || undefined
    const page       = parseInt(searchParams.get('page') || '1')
    const limit      = Math.min(parseInt(searchParams.get('limit') || '24'), 100)

    const result = await searchProfiles(q, type, discipline, page, limit)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Profiles search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.nom || !body.type) {
      return NextResponse.json({ error: 'Nom et type requis' }, { status: 400 })
    }

    // Récupérer l'utilisateur connecté si disponible
    let userId: string | null = null
    const cookieStore = cookies()
    const token = cookieStore.get('auth_token')?.value
    if (token) {
      try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8')
        const [id] = decoded.split(':')
        const user = await getUserById(id)
        if (user) userId = user.id
      } catch {}
    }

    const profile = await createProfile({
      user_id:        userId,
      nom:            body.nom,
      type:           body.type,
      discipline:     body.discipline || null,
      bio:            body.bio || null,
      ville:          body.ville || null,
      pays:           body.pays || null,
      region:         body.region || null,
      image_url:      body.image_url || null,
      lien:           body.lien || null,
      lien_instagram: body.lien_instagram || null,
      lien_facebook:  body.lien_facebook || null,
      lien_youtube:   body.lien_youtube || null,
      tags:           body.tags || null,
      created_by:     userId,
    })

    return NextResponse.json({ data: profile }, { status: 201 })
  } catch (error) {
    console.error('Profile creation error:', error)
    return NextResponse.json({ error: 'Création échouée' }, { status: 500 })
  }
}
