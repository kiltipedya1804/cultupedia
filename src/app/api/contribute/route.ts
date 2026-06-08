// src/app/api/contribute/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.nom || !body.type || !body.discipline || !body.description) {
      return NextResponse.json(
        { error: 'Nom, type, discipline et description requis' },
        { status: 400 }
      )
    }

    // Stocker la contribution dans une table dédiée en attente de validation
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

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Contribution error:', error)
    return NextResponse.json({ error: 'Soumission échouée' }, { status: 500 })
  }
}
