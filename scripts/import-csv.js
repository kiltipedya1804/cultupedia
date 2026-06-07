// scripts/import-csv.js
// Usage: node scripts/import-csv.js ./data/cultupedia_musique.csv
const fs   = require('fs')
const path = require('path')
const postgres = require('postgres')

require('dotenv').config({ path: '.env.local' })

const sql = postgres(process.env.DATABASE_URL, { ssl: { rejectUnauthorized: false } })

const VALID_DISCS    = ['musique','danse','cinema','graffiti','theatre','gastronomie','edition']
const VALID_REGIONS  = ['Caraïbes','Amérique du Nord','Amérique du Sud','Europe','Afrique','Asie','Océanie']
const VALID_STATUTS  = ['en_cours','archive','en_projet','fermé']

function clean(v) {
  if (!v) return ''
  const s = String(v).trim()
  return ['—','null','undefined',''].includes(s) ? '' : s
}

function normalizeDisc(raw) {
  const d = raw.toLowerCase().trim()
  if (VALID_DISCS.includes(d)) return d
  if (d.includes('music')) return 'musique'
  if (d.includes('dans')) return 'danse'
  if (d.includes('cin'))  return 'cinema'
  if (d.includes('graf') || d.includes('art')) return 'graffiti'
  if (d.includes('theat')) return 'theatre'
  if (d.includes('gastro')) return 'gastronomie'
  if (d.includes('edit')) return 'edition'
  return 'musique'
}

function normalizeRegion(raw) {
  const r = (raw || '').trim()
  if (VALID_REGIONS.includes(r)) return r
  if (r.includes('Nord')) return 'Amérique du Nord'
  if (r.includes('Sud'))  return 'Amérique du Sud'
  if (r.includes('Afr'))  return 'Afrique'
  if (r.includes('Eur'))  return 'Europe'
  if (r.includes('Asi'))  return 'Asie'
  if (r.includes('Oce'))  return 'Océanie'
  return 'Caraïbes'
}

function normalizeStatut(raw) {
  const s = (raw || '').toLowerCase().trim()
  if (s === 'en_cours' || s === 'actif' || s === 'en cours') return 'en_cours'
  if (s === 'archive' || s === 'archivé') return 'archive'
  if (s === 'en_projet') return 'en_projet'
  if (s === 'fermé' || s === 'ferme') return 'fermé'
  return 'en_cours'
}

async function parseCSV(filepath) {
  const text = fs.readFileSync(filepath, 'utf-8')
  const lines = text.split('\n')
  const headers = lines[0].split(';').map(h => h.trim())
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const cols = line.split(';')
    const row = {}
    headers.forEach((h, j) => { row[h] = cols[j] ?? '' })
    rows.push(row)
  }
  return rows
}

async function importFile(filepath) {
  console.log(`\n📂 Import: ${path.basename(filepath)}`)
  const rows = await parseCSV(filepath)
  console.log(`   ${rows.length} lignes à traiter`)

  const [job] = await sql`
    INSERT INTO import_jobs (filename, total, status)
    VALUES (${path.basename(filepath)}, ${rows.length}, 'running')
    RETURNING id
  `

  let processed = 0, errors = 0
  const batchSize = 200

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    for (const row of batch) {
      const nom = clean(row['Nom'] || row['nom'])
      if (!nom) { errors++; continue }
      try {
        await sql`
          INSERT INTO entries (
            slug, nom, type, discipline, sous_discipline, annee, statut,
            ville, pays, region, responsable, institution, studio,
            description, reference, tag, lien, rubrique
          ) VALUES (
            generate_slug(${nom}),
            ${nom},
            ${clean(row['Type'] || row['type']) || 'artiste_solo'},
            ${normalizeDisc(clean(row['Discipline'] || row['discipline']))},
            ${clean(row['Sous-discipline'] || row['sous_discipline']) || ''},
            ${clean(row['Année'] || row['annee'] || row['Annee']) || null},
            ${normalizeStatut(clean(row['Statut'] || row['statut']))},
            ${clean(row['Ville'] || row['ville']) || ''},
            ${clean(row['Pays'] || row['pays']) || 'Haïti'},
            ${normalizeRegion(clean(row['Région'] || row['region'] || row['Region']))},
            ${clean(row['Responsable'] || row['responsable']) || null},
            ${clean(row['Institution'] || row['institution']) || null},
            ${clean(row['Studio'] || row['studio']) || null},
            ${clean(row['Description'] || row['description']) || ''},
            ${clean(row['Référence'] || row['reference']) || null},
            ${clean(row['Tag'] || row['tag']) || null},
            ${clean(row['Lien'] || row['lien']) || null},
            ${clean(row['Rubrique'] || row['rubrique']) || null}
          )
          ON CONFLICT (slug) DO UPDATE SET
            description = EXCLUDED.description,
            updated_at  = NOW()
        `
        processed++
      } catch (err) {
        errors++
        if (errors < 10) console.warn(`   ⚠ Erreur ligne ${i}: ${err.message?.slice(0,80)}`)
      }
    }
    process.stdout.write(`\r   ✓ ${processed} / ${rows.length} (${errors} erreurs)`)
    await sql`UPDATE import_jobs SET processed=${processed}, errors=${errors} WHERE id=${job.id}`
  }

  await sql`UPDATE import_jobs SET status='done', finished_at=NOW() WHERE id=${job.id}`
  console.log(`\n   ✅ Terminé: ${processed} importées, ${errors} erreurs`)
  return { processed, errors }
}

async function main() {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    // Importer tous les fichiers du dossier data/
    const dataDir = path.join(__dirname, '..', 'data')
    if (!fs.existsSync(dataDir)) {
      console.error('Dossier data/ introuvable. Passez un chemin en argument.')
      process.exit(1)
    }
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.csv'))
    let total = 0
    for (const f of files) {
      const { processed } = await importFile(path.join(dataDir, f))
      total += processed
    }
    console.log(`\n🎉 Import complet: ${total} entrées au total`)
  } else {
    for (const filepath of args) {
      await importFile(path.resolve(filepath))
    }
  }

  await sql`REFRESH MATERIALIZED VIEW discipline_stats`
  console.log('\n📊 Stats rafraîchies')
  await sql.end()
}

main().catch(err => { console.error(err); process.exit(1) })
