// src/lib/db.ts
import postgres from 'postgres'
import type { Entry, SearchFilters, SearchResult, Facets, GlobalStats, Discipline } from '@/types'

// ── Connexion ─────────────────────────────────────────────
const connectionString = process.env.DATABASE_URL!

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

export const sql = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

// ── Helpers ───────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 80)
}

// ── Queries principales ───────────────────────────────────

export async function getEntryBySlug(slug: string): Promise<Entry | null> {
  const rows = await sql<Entry[]>`
    SELECT *, 
      (SELECT json_agg(e2) FROM entries e2 
       JOIN entry_relations er ON e2.id = er.related_id 
       WHERE er.entry_id = e.id LIMIT 6) AS related
    FROM entries e
    WHERE slug = ${slug}
    LIMIT 1
  `
  if (rows.length === 0) return null
  
  // Incrémenter vues en background
  sql`SELECT increment_views(${rows[0].id})`.catch(() => {})
  
  return rows[0]
}

export async function getEntryById(id: number): Promise<Entry | null> {
  const rows = await sql<Entry[]>`
    SELECT * FROM entries WHERE id = ${id} LIMIT 1
  `
  return rows[0] || null
}

export async function searchEntries(filters: SearchFilters): Promise<SearchResult> {
  const {
    q = '', discipline = '', region = '', statut = '',
    pays = '', type = '', sous_disc = '', featured,
    page = 1, limit = 24, sort = 'created_at', order = 'desc'
  } = filters

  const offset = (page - 1) * limit

  // Recherche via fonction PostgreSQL
  const rows = await sql`
    SELECT * FROM search_entries(
      ${q || null},
      ${discipline || null},
      ${region || null},
      ${statut || null},
      ${pays || null},
      ${type || null},
      ${sous_disc || null},
      ${featured ?? null},
      ${limit},
      ${offset},
      ${sort},
      ${order}
    )
  `

  const total = Number(rows[0]?.total_count ?? 0)

  // Facettes en parallèle
  const [discFacets, regionFacets, statutFacets, typesFacets, paysFacets] = await Promise.all([
    sql`SELECT discipline AS value, discipline AS label, COUNT(*) AS count FROM entries 
        WHERE (${q || null} IS NULL OR search_vector @@ websearch_to_tsquery('french', unaccent(${q})))
        GROUP BY discipline ORDER BY count DESC`,
    sql`SELECT region AS value, region AS label, COUNT(*) AS count FROM entries 
        WHERE (${discipline || null} IS NULL OR discipline::TEXT = ${discipline})
        GROUP BY region ORDER BY count DESC`,
    sql`SELECT statut AS value, statut AS label, COUNT(*) AS count FROM entries 
        GROUP BY statut ORDER BY count DESC`,
    sql`SELECT type AS value, type AS label, COUNT(*) AS count FROM entries 
        WHERE (${discipline || null} IS NULL OR discipline::TEXT = ${discipline})
        GROUP BY type ORDER BY count DESC LIMIT 15`,
    sql`SELECT pays AS value, pays AS label, COUNT(*) AS count FROM entries 
        GROUP BY pays ORDER BY count DESC LIMIT 20`,
  ])

  const facets: Facets = {
    disciplines:  discFacets.map(r => ({ value: String(r.value), label: String(r.label), count: Number(r.count) })),
    regions:      regionFacets.map(r => ({ value: String(r.value), label: String(r.label), count: Number(r.count) })),
    statuts:      statutFacets.map(r => ({ value: String(r.value), label: String(r.label), count: Number(r.count) })),
    types:        typesFacets.map(r => ({ value: String(r.value), label: String(r.label), count: Number(r.count) })),
    pays:         paysFacets.map(r => ({ value: String(r.value), label: String(r.label), count: Number(r.count) })),
    sous_discs:   [],
  }

  return {
    entries:    rows as unknown as Entry[],
    total,
    page,
    totalPages: Math.ceil(total / limit),
    facets,
  }
}

export async function getEntriesByDiscipline(discipline: Discipline, limit = 24, offset = 0): Promise<{ entries: Entry[]; total: number }> {
  const [entries, countResult] = await Promise.all([
    sql<Entry[]>`
      SELECT * FROM entries 
      WHERE discipline = ${discipline}
      ORDER BY featured DESC, views DESC, created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `,
    sql`SELECT COUNT(*) AS count FROM entries WHERE discipline = ${discipline}`,
  ])
  return { entries, total: Number(countResult[0]?.count ?? 0) }
}

export async function getFeaturedEntries(limit = 8): Promise<Entry[]> {
  return sql<Entry[]>`
    SELECT * FROM entries 
    WHERE featured = TRUE 
    ORDER BY views DESC, created_at DESC 
    LIMIT ${limit}
  `
}

export async function getRecentEntries(limit = 12): Promise<Entry[]> {
  return sql<Entry[]>`
    SELECT * FROM entries 
    ORDER BY created_at DESC 
    LIMIT ${limit}
  `
}

export async function getGlobalStats(): Promise<GlobalStats> {
  const [total, byDisc, byRegion, byStatut, countries] = await Promise.all([
    sql`SELECT COUNT(*) AS count FROM entries`,
    sql`SELECT discipline, COUNT(*) AS count FROM entries GROUP BY discipline`,
    sql`SELECT region, COUNT(*) AS count FROM entries GROUP BY region`,
    sql`SELECT statut, COUNT(*) AS count FROM entries GROUP BY statut`,
    sql`SELECT COUNT(DISTINCT pays) AS count FROM entries`,
  ])

  return {
    total: Number(total[0]?.count ?? 0),
    by_discipline: Object.fromEntries(byDisc.map(r => [r.discipline, Number(r.count)])) as Record<Discipline, number>,
    by_region:     Object.fromEntries(byRegion.map(r => [r.region, Number(r.count)])) as any,
    by_statut:     Object.fromEntries(byStatut.map(r => [r.statut, Number(r.count)])) as any,
    featured_count: 0,
    countries:     Number(countries[0]?.count ?? 0),
  }
}

export async function getRelatedEntries(entryId: number, discipline: Discipline, limit = 6): Promise<Entry[]> {
  return sql<Entry[]>`
    SELECT e.* FROM entries e
    WHERE e.id != ${entryId}
      AND (e.discipline = ${discipline} OR 
           e.id IN (SELECT related_id FROM entry_relations WHERE entry_id = ${entryId}))
    ORDER BY e.featured DESC, e.views DESC
    LIMIT ${limit}
  `
}

// ── Admin CRUD ────────────────────────────────────────────

export async function createEntry(data: Omit<Entry, 'id' | 'slug' | 'created_at' | 'updated_at' | 'views'>): Promise<Entry> {
  const slug = slugify(data.nom)
  const rows = await sql<Entry[]>`
    INSERT INTO entries (
      slug, nom, type, discipline, sous_discipline, annee, statut,
      ville, pays, region, responsable, institution, studio,
      description, reference, tag, lien, rubrique, image_url, featured
    ) VALUES (
      generate_slug(${data.nom}), ${data.nom}, ${data.type}, ${data.discipline},
      ${data.sous_discipline}, ${data.annee ?? null}, ${data.statut},
      ${data.ville}, ${data.pays}, ${data.region}, ${data.responsable ?? null},
      ${data.institution ?? null}, ${data.studio ?? null}, ${data.description},
      ${data.reference ?? null}, ${data.tag ?? null}, ${data.lien ?? null},
      ${data.rubrique ?? null}, ${data.image_url ?? null}, ${data.featured ?? false}
    )
    RETURNING *
  `
  return rows[0]
}

export async function updateEntry(id: number, data: Partial<Entry>): Promise<Entry> {
  // Construction dynamique de la mise à jour
  const updates = Object.entries(data)
    .filter(([k]) => !['id', 'slug', 'created_at', 'updated_at', 'search_vector'].includes(k))
    .map(([k, v]) => sql`${sql(k)} = ${v}`)
  
  if (updates.length === 0) {
    const entry = await getEntryById(id)
    return entry!
  }

  const rows = await sql<Entry[]>`
    UPDATE entries SET ${sql.join(updates, sql`, `)}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return rows[0]
}

export async function deleteEntry(id: number): Promise<void> {
  await sql`DELETE FROM entries WHERE id = ${id}`
}

// ── Import CSV en masse ───────────────────────────────────
export async function bulkImportEntries(
  entries: Array<Omit<Entry, 'id' | 'slug' | 'created_at' | 'updated_at' | 'views'>>,
  jobId: string
): Promise<{ processed: number; errors: number }> {
  let processed = 0
  let errors = 0
  const batchSize = 500

  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize)
    try {
      await sql.begin(async sql => {
        for (const entry of batch) {
          try {
            await sql`
              INSERT INTO entries (
                slug, nom, type, discipline, sous_discipline, annee, statut,
                ville, pays, region, responsable, institution, studio,
                description, reference, tag, lien, rubrique
              ) VALUES (
                generate_slug(${entry.nom}), ${entry.nom}, ${entry.type},
                ${entry.discipline}, ${entry.sous_discipline}, ${entry.annee ?? null},
                ${entry.statut}, ${entry.ville}, ${entry.pays}, ${entry.region},
                ${entry.responsable ?? null}, ${entry.institution ?? null},
                ${entry.studio ?? null}, ${entry.description},
                ${entry.reference ?? null}, ${entry.tag ?? null},
                ${entry.lien ?? null}, ${entry.rubrique ?? null}
              )
              ON CONFLICT (slug) DO UPDATE SET
                description = EXCLUDED.description,
                updated_at = NOW()
            `
            processed++
          } catch {
            errors++
          }
        }
      })
    } catch {
      errors += batch.length
    }

    // Mise à jour progression
    await sql`
      UPDATE import_jobs 
      SET processed = ${processed}, errors = ${errors}
      WHERE id = ${jobId}
    `
  }

  await sql`
    UPDATE import_jobs 
    SET status = 'done', finished_at = NOW()
    WHERE id = ${jobId}
  `

  return { processed, errors }
}
