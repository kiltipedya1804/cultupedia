// src/app/api/newsletter/confirm/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get('token')
  if (!token) return NextResponse.redirect('https://cultupedia.vercel.app/newsletter/error')

  const rows = await sql`
    UPDATE newsletter_subscribers
    SET confirmed = TRUE
    WHERE token = ${token} AND confirmed = FALSE AND unsubscribed_at IS NULL
    RETURNING email
  `

  if (rows.length === 0) {
    return NextResponse.redirect('https://cultupedia.vercel.app/newsletter/error')
  }

  return NextResponse.redirect('https://cultupedia.vercel.app/newsletter/confirmed')
}
