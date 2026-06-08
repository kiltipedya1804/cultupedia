// ── À ajouter dans src/lib/db.ts ─────────────────────────

export interface Profile {
  id: string
  user_id: string | null
  slug: string
  nom: string
  type: string
  discipline: string | null
  bio: string | null
  ville: string | null
  pays: string | null
  region: string | null
  image_url: string | null
  lien: string | null
  lien_instagram: string | null
  lien_facebook: string | null
  lien_youtube: string | null
  tags: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_by: string | null
  validated_by: string | null
  validated_at: string | null
  created_at: string
  updated_at: string
}

function slugifyProfile(text: string): string {
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

export async function createProfile(
  data: Omit<Profile, 'id' | 'slug' | 'status' | 'validated_by' | 'validated_at' | 'created_at' | 'updated_at'>
): Promise<Profile> {
  let slug = slugifyProfile(data.nom)
  // Ensure unique slug
  const existing = await sql`SELECT slug FROM profiles WHERE slug LIKE ${slug + '%'} ORDER BY slug`
  if (existing.length > 0) {
    slug = `${slug}-${existing.length + 1}`
  }

  const rows = await sql<Profile[]>`
    INSERT INTO profiles (
      user_id, slug, nom, type, discipline, bio, ville, pays, region,
      image_url, lien, lien_instagram, lien_facebook, lien_youtube, tags, created_by
    ) VALUES (
      ${data.user_id ?? null}, ${slug}, ${data.nom}, ${data.type},
      ${data.discipline ?? null}, ${data.bio ?? null}, ${data.ville ?? null},
      ${data.pays ?? null}, ${data.region ?? null}, ${data.image_url ?? null},
      ${data.lien ?? null}, ${data.lien_instagram ?? null}, ${data.lien_facebook ?? null},
      ${data.lien_youtube ?? null}, ${data.tags ?? null}, ${data.created_by ?? null}
    )
    RETURNING *
  `
  return rows[0]
}

export async function getProfileBySlug(slug: string): Promise<Profile | null> {
  const rows = await sql<Profile[]>`
    SELECT * FROM profiles WHERE slug = ${slug} AND status = 'approved' LIMIT 1
  `
  return rows[0] || null
}

export async function getProfilesByUser(userId: string): Promise<Profile[]> {
  return sql<Profile[]>`
    SELECT * FROM profiles WHERE created_by = ${userId} ORDER BY created_at DESC
  `
}

export async function getPendingProfiles(): Promise<Profile[]> {
  return sql<Profile[]>`
    SELECT * FROM profiles WHERE status = 'pending' ORDER BY created_at ASC
  `
}

export async function validateProfile(id: string, status: 'approved' | 'rejected', adminId: string): Promise<void> {
  await sql`
    UPDATE profiles
    SET status = ${status}, validated_by = ${adminId}, validated_at = NOW(), updated_at = NOW()
    WHERE id = ${id}
  `
}

export async function searchProfiles(q?: string, type?: string, discipline?: string, page = 1, limit = 24): Promise<{ profiles: Profile[]; total: number }> {
  const offset = (page - 1) * limit
  const rows = await sql<Profile[]>`
    SELECT * FROM profiles
    WHERE status = 'approved'
      AND (${q ?? null} IS NULL OR nom ILIKE ${'%' + (q ?? '') + '%'} OR bio ILIKE ${'%' + (q ?? '') + '%'})
      AND (${type ?? null} IS NULL OR type = ${type ?? ''})
      AND (${discipline ?? null} IS NULL OR discipline::TEXT = ${discipline ?? ''})
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `
  const countRows = await sql`
    SELECT COUNT(*) AS count FROM profiles
    WHERE status = 'approved'
      AND (${q ?? null} IS NULL OR nom ILIKE ${'%' + (q ?? '') + '%'})
      AND (${type ?? null} IS NULL OR type = ${type ?? ''})
      AND (${discipline ?? null} IS NULL OR discipline::TEXT = ${discipline ?? ''})
  `
  return { profiles: rows, total: Number(countRows[0]?.count ?? 0) }
}
