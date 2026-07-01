// src/app/sitemap.ts
import { MetadataRoute } from 'next'
import { sql } from '@/lib/db'
import { CATEGORIES } from '@/lib/categories'

const BASE_URL = 'https://cultupedia.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/profiles`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/map`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/graph`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE_URL}/community`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/leaderboard`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.5 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  // Pages catégories
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map(cat => ({
    url: `${BASE_URL}/categories/${cat.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Entrées (limité à 45 000 pour rester dans les limites du sitemap)
  let entryPages: MetadataRoute.Sitemap = []
  try {
    const entries = await sql`
      SELECT slug, updated_at
      FROM entries
      ORDER BY views DESC, featured DESC
      LIMIT 45000
    `
    entryPages = entries.map((e: any) => ({
      url: `${BASE_URL}/entry/${e.slug}`,
      lastModified: e.updated_at ? new Date(e.updated_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  } catch {}

  // Profils approuvés
  let profilePages: MetadataRoute.Sitemap = []
  try {
    const profiles = await sql`
      SELECT slug, updated_at FROM profiles WHERE status = 'approved' LIMIT 5000
    `
    profilePages = profiles.map((p: any) => ({
      url: `${BASE_URL}/profile/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))
  } catch {}

  return [...staticPages, ...categoryPages, ...entryPages, ...profilePages]
}
