// src/app/api/proxy/image/route.ts
import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_DOMAINS = [
  'upload.wikimedia.org',
  'commons.wikimedia.org',
  'en.wikipedia.org',
  'fr.wikipedia.org',
]

export async function GET(req: NextRequest) {
  const url = new URL(req.url).searchParams.get('url')

  if (!url) return NextResponse.json({ error: 'URL manquante' }, { status: 400 })

  try {
    const parsed = new URL(url)
    const allowed = ALLOWED_DOMAINS.some(d => parsed.hostname === d)
    if (!allowed) return NextResponse.json({ error: 'Domaine non autorisé' }, { status: 403 })

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Cultupedia/1.0 (https://cultupedia.vercel.app; contact@cultupedia.ht) Node.js',
        'Accept': 'image/webp,image/png,image/jpeg,*/*',
        'Referer': 'https://cultupedia.vercel.app',
      },
    })

    if (!res.ok) return NextResponse.json({ error: 'Image non disponible' }, { status: 404 })

    const buffer = await res.arrayBuffer()
    const contentType = res.headers.get('content-type') ?? 'image/jpeg'

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Erreur proxy' }, { status: 500 })
  }
}
