// src/app/api/contribute/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sql, addPoints, getUserByEmail } from '@/lib/db'
import { GAMIFICATION_POINTS } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.nom || !body.type || !body.discipline || !body.description) {
      return NextResponse.json(
        { error: 'Nom, type, discipline et description requis' },
        { status: 400 }
      )
    }

    await sql`
      INSERT INTO contributions (
        nom, type, discipline, sous_discipline, statut, annee,
        ville, pays, region, responsable, institution,
        description, tag, lien, rubrique, image_url,
        contributeur_nom, contributeur_email, contributeur_note
      ) VALUES (
        ${body.nom}, ${body.type}, ${body.discipline},
        ${body.sous_discipline || null}, ${body.statut || 'en_cours'},
        ${body.annee || null}, ${body.ville || null}, ${body.pays || 'Haïti'},
        ${body.region || 'Caraïbes'}, ${body.responsable || null},
        ${body.institution || null}, ${body.description},
        ${body.tag || null}, ${body.lien || null},
        ${body.rubrique || null}, ${body.image_url || null},
        ${body.contributeur_nom || null}, ${body.contributeur_email || null},
        ${body.contributeur_note || null}
      )
    `

    // Award points if the contributor has an account
    if (body.contributeur_email) {
      const user = await getUserByEmail(body.contributeur_email)
      if (user) {
        await addPoints(user.id, GAMIFICATION_POINTS.CONTRIBUTION_SUBMITTED)
      }
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Contribution error:', error)
    return NextResponse.json({ error: 'Soumission échouée' }, { status: 500 })
  }
}
