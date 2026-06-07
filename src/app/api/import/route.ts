// src/app/api/import/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sql, bulkImportEntries } from '@/lib/db'
import Papa from 'papaparse'
import type { Discipline, Region, Statut } from '@/types'

const VALID_DISCIPLINES: Discipline[] = ['musique','danse','cinema','graffiti','theatre','gastronomie','edition']
const VALID_REGIONS: Region[] = ['Caraïbes','Amérique du Nord','Amérique du Sud','Europe','Afrique','Asie','Océanie']
const VALID_STATUTS: Statut[] = ['en_cours','archive','en_projet','fermé']

function cleanValue(v: unknown): string {
  if (v === null || v === undefined) return ''
  const s = String(v).trim()
  return s === '—' || s === 'null' || s === 'undefined' ? '' : s
}

function normalizeDisc(raw: string): Discipline {
  const d = raw.toLowerCase().trim()
  if (VALID_DISCIPLINES.includes(d as Discipline)) return d as Discipline
  if (d.includes('music')) return 'musique'
  if (d.includes('dans')) return 'danse'
  if (d.includes('cin')) return 'cinema'
  if (d.includes('graf') || d.includes('art')) return 'graffiti'
  if (d.includes('theat') || d.includes('teyat')) return 'theatre'
  if (d.includes('gastro') || d.includes('cuisine')) return 'gastronomie'
  if (d.includes('edit') || d.includes('livre')) return 'edition'
  return 'musique'
}

function normalizeRegion(raw: string): Region {
  const r = raw.trim()
  if (VALID_REGIONS.includes(r as Region)) return r as Region
  if (r.toLowerCase().includes('nord')) return 'Amérique du Nord'
  if (r.toLowerCase().includes('sud'))  return 'Amérique du Sud'
  if (r.toLowerCase().includes('afr'))  return 'Afrique'
  if (r.toLowerCase().includes('eur'))  return 'Europe'
  if (r.toLowerCase().includes('asi'))  return 'Asie'
  if (r.toLowerCase().includes('oce'))  return 'Océanie'
  return 'Caraïbes'
}

function normalizeStatut(raw: string): Statut {
  const s = raw.toLowerCase().trim()
  if (s === 'en_cours' || s === 'en cours' || s === 'actif') return 'en_cours'
  if (s === 'archive' || s === 'archivé') return 'archive'
  if (s === 'en_projet' || s === 'en projet') return 'en_projet'
  if (s === 'fermé' || s === 'ferme' || s === 'closed') return 'fermé'
  return 'en_cours'
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-api-key')
    if (apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const text = await file.text()

    // Parser CSV
    const { data: rows, errors } = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      delimiter: ';',
    })

    if (errors.length > 0) {
      console.warn('CSV parse warnings:', errors.slice(0, 5))
    }

    // Créer un job d'import
    const [job] = await sql`
      INSERT INTO import_jobs (filename, total, status)
      VALUES (${file.name}, ${rows.length}, 'running')
      RETURNING id
    `

    // Parser les entrées
    const entries = (rows as Record<string, unknown>[])
      .filter(row => row['Nom'] || row['nom'])
      .map(row => {
        const nom = cleanValue(row['Nom'] || row['nom'])
        if (!nom) return null

        return {
          nom,
          type:            cleanValue(row['Type'] || row['type']) || 'artiste_solo',
          discipline:      normalizeDisc(cleanValue(row['Discipline'] || row['discipline'])),
          sous_discipline: cleanValue(row['Sous-discipline'] || row['sous_discipline'] || row['Sous_discipline']) || '',
          annee:           cleanValue(row['Année'] || row['annee'] || row['Annee']) || null,
          statut:          normalizeStatut(cleanValue(row['Statut'] || row['statut'])),
          ville:           cleanValue(row['Ville'] || row['ville']) || '',
          pays:            cleanValue(row['Pays'] || row['pays']) || 'Haïti',
          region:          normalizeRegion(cleanValue(row['Région'] || row['region'] || row['Region'])),
          responsable:     cleanValue(row['Responsable'] || row['responsable']) || null,
          institution:     cleanValue(row['Institution'] || row['institution']) || null,
          studio:          cleanValue(row['Studio'] || row['studio']) || null,
          description:     cleanValue(row['Description'] || row['description']) || '',
          reference:       cleanValue(row['Référence'] || row['reference'] || row['Reference']) || null,
          tag:             cleanValue(row['Tag'] || row['tag']) || null,
          lien:            cleanValue(row['Lien'] || row['lien']) || null,
          rubrique:        cleanValue(row['Rubrique'] || row['rubrique']) || null,
          image_url:       null,
          featured:        false,
        }
      })
      .filter(Boolean) as any[]

    // Import asynchrone
    const { processed, errors: importErrors } = await bulkImportEntries(entries, job.id)

    return NextResponse.json({
      success: true,
      jobId: job.id,
      processed,
      errors: importErrors,
      total: entries.length,
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ error: 'Import failed', details: String(error) }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-api-key')
    if (apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const jobs = await sql`
      SELECT * FROM import_jobs ORDER BY created_at DESC LIMIT 20
    `
    return NextResponse.json({ data: jobs })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
