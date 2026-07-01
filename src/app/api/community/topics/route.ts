// src/app/api/community/topics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { cookies } from 'next/headers'
import { getUserById } from '@/lib/auth'

async function getCurrentUser() {
  const token = cookies().get('auth_token')?.value
  if (!token) return null
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [id] = decoded.split(':')
    return await getUserById(id)
  } catch { return null }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { titre, contenu, category_id, entry_id } = await req.json()
  if (!titre?.trim() || !contenu?.trim()) {
    return NextResponse.json({ error: 'Titre et contenu requis' }, { status: 400 })
  }

  const rows = await sql`
    INSERT INTO forum_topics (titre, contenu, category_id, entry_id, author_id)
    VALUES (${titre}, ${contenu}, ${category_id ?? 'general'}, ${entry_id ?? null}, ${user.id})
    RETURNING *
  `
  return NextResponse.json({ topic: rows[0] }, { status: 201 })
}
