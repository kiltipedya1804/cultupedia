// src/app/api/admin/profiles/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sql, validateProfile, addPoints, GAMIFICATION_POINTS } from '@/lib/db'
import { cookies } from 'next/headers'
import { getUserById } from '@/lib/auth'

async function getAdminUser() {
  const token = cookies().get('auth_token')?.value
  if (!token) return null
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [id] = decoded.split(':')
    const user = await getUserById(id)
    if (user?.role === 'admin' || user?.role === 'moderator') return user
    return null
  } catch { return null }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { status } = await req.json()
  if (!['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
  }

  const rows = await sql`SELECT * FROM profiles WHERE id = ${params.id}`
  const profile = rows[0]
  if (!profile) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  await validateProfile(params.id, status, admin.id)

  if (status === 'approved' && profile.user_id) {
    await addPoints(profile.user_id, GAMIFICATION_POINTS.PROFILE_APPROVED)
  }

  return NextResponse.json({ success: true })
}
