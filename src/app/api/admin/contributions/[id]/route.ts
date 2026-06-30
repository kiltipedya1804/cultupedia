// src/app/api/admin/contributions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sql, createEntry, addPoints, GAMIFICATION_POINTS } from '@/lib/db'
import { getUserByEmail } from '@/lib/auth'
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

  const rows = await sql`SELECT * FROM contributions WHERE id = ${params.id}`
  const contrib = rows[0]
  if (!contrib) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  await sql`
    UPDATE contributions SET status = ${status}, reviewed_by = ${admin.id}, reviewed_at = NOW()
    WHERE id = ${params.id}
  `

  if (status === 'approved') {
    // Créer l'entrée réelle dans la table entries
    const entry = await createEntry({
      nom: contrib.nom,
      type: contrib.type,
      discipline: contrib.discipline,
      sous_discipline: contrib.sous_discipline ?? '',
      annee: contrib.annee,
      statut: contrib.statut ?? 'en_cours',
      ville: contrib.ville ?? '',
      pays: contrib.pays ?? '',
      region: contrib.region ?? 'Caraïbes',
      responsable: contrib.responsable,
      institution: contrib.institution,
      studio: null,
      description: contrib.description,
      reference: null,
      tag: contrib.tag,
      lien: contrib.lien,
      rubrique: contrib.rubrique,
      image_url: contrib.image_url,
      featured: false,
    } as any)

    // Lier à la catégorie correspondante
    await sql`
      INSERT INTO entry_categories (entry_id, category, is_primary)
      VALUES (${entry.id}, ${contrib.discipline}, TRUE)
      ON CONFLICT DO NOTHING
    `

    // Récompenser le contributeur
    if (contrib.contributeur_email) {
      const user = await getUserByEmail(contrib.contributeur_email)
      if (user) {
        await addPoints(user.id, GAMIFICATION_POINTS.CONTRIBUTION_APPROVED)
      }
    }
  }

  return NextResponse.json({ success: true })
}
