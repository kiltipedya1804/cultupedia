// src/app/api/newsletter/unsubscribe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Token manquant' }, { status: 400 })

  await sql`
    UPDATE newsletter_subscribers
    SET unsubscribed_at = NOW()
    WHERE token = ${token}
  `

  return NextResponse.redirect('https://cultupedia.vercel.app/newsletter/unsubscribed')
}
