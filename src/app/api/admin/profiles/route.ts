// src/app/api/admin/profiles/route.ts
import { NextResponse } from 'next/server'
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

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }
  const profiles = await sql`
    SELECT * FROM profiles WHERE status = 'pending' ORDER BY created_at ASC
  `
  return NextResponse.json({ profiles })
}
