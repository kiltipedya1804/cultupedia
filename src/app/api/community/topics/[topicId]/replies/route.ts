// src/app/api/community/topics/[topicId]/replies/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sql, addPoints, GAMIFICATION_POINTS } from '@/lib/db'
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

export async function POST(req: NextRequest, { params }: { params: { topicId: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { contenu, parent_id } = await req.json()
  if (!contenu?.trim()) return NextResponse.json({ error: 'Contenu requis' }, { status: 400 })

  // Check topic not locked
  const topics = await sql`SELECT locked FROM forum_topics WHERE id = ${params.topicId}`
  if (topics.length === 0) return NextResponse.json({ error: 'Sujet introuvable' }, { status: 404 })
  if (topics[0].locked) return NextResponse.json({ error: 'Sujet fermé' }, { status: 403 })

  const rows = await sql`
    INSERT INTO forum_replies (topic_id, author_id, contenu, parent_id)
    VALUES (${params.topicId}, ${user.id}, ${contenu}, ${parent_id ?? null})
    RETURNING *
  `

  // Update topic timestamp
  await sql`UPDATE forum_topics SET updated_at = NOW() WHERE id = ${params.topicId}`

  // Award points for participation
  await addPoints(user.id, 5)

  const reply = { ...rows[0], author_name: user.full_name }
  return NextResponse.json({ reply }, { status: 201 })
}
