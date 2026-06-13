// src/app/api/profiles/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getProfileBySlugAny, updateProfile } from '@/lib/db'
import { cookies } from 'next/headers'
import { getUserById } from '@/lib/auth'

async function getCurrentUserId(): Promise<string | null> {
  const token = cookies().get('auth_token')?.value
  if (!token) return null
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [id] = decoded.split(':')
    const user = await getUserById(id)
    return user?.id ?? null
  } catch { return null }
}

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const profile = await getProfileBySlugAny(params.slug)
  if (!profile) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  // Si pas approuvé, seul le propriétaire peut voir
  if (profile.status !== 'approved') {
    const userId = await getCurrentUserId()
    if (!userId || userId !== profile.created_by) {
      return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
    }
  }
  return NextResponse.json({ data: profile })
}

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  const profile = await getProfileBySlugAny(params.slug)
  if (!profile) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  const userId = await getCurrentUserId()
  if (!userId || userId !== profile.created_by) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const body = await req.json()
  // Repasser en attente de validation après modification
  const updated = await updateProfile(profile.id, { ...body, status: 'pending' as any })
  return NextResponse.json({ data: updated })
}
