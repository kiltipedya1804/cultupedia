// src/app/api/community/topics/[topicId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { topicId: string } }) {
  // Increment views
  await sql`UPDATE forum_topics SET views = views + 1 WHERE id = ${params.topicId}`

  const topics = await sql`
    SELECT ft.*, u.full_name AS author_name,
      fc.nom AS category_nom, fc.emoji AS category_emoji,
      COUNT(fr.id)::int AS reply_count
    FROM forum_topics ft
    LEFT JOIN users u ON u.id = ft.author_id
    LEFT JOIN forum_categories fc ON fc.id = ft.category_id
    LEFT JOIN forum_replies fr ON fr.topic_id = ft.id
    WHERE ft.id = ${params.topicId}
    GROUP BY ft.id, u.full_name, fc.nom, fc.emoji
  `
  if (topics.length === 0) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  const replies = await sql`
    SELECT fr.*, u.full_name AS author_name
    FROM forum_replies fr
    LEFT JOIN users u ON u.id = fr.author_id
    WHERE fr.topic_id = ${params.topicId}
    ORDER BY fr.created_at ASC
  `

  return NextResponse.json({ topic: topics[0], replies })
}
