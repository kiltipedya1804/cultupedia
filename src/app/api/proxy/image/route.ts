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
    const parsed = new URL(decodeURIComponent(url))
    const allowed = ALLOWED_DOMAINS.some(d => parsed.hostname === d)
    if (!allowed) return NextResponse.json({ error: 'Domaine non autorisé' }, { status: 403 })

    const res = await fetch(parsed.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/avif,image/png,image/jpeg,*/*;q=0.8',
        'Accept-Language': 'fr,en;q=0.9',
        'Referer': 'https://en.wikipedia.org/',
        'Cache-Control': 'no-cache',
      },
    })

    if (!res.ok) {
      console.error(`Proxy failed: ${res.status} for ${url}`)
      return NextResponse.json({ error: 'Image non disponible', status: res.status }, { status: 404 })
    }

    const buffer = await res.arrayBuffer()
    const contentType = res.headers.get('content-type') ?? 'image/jpeg'

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=604800',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json({ error: 'Erreur proxy' }, { status: 500 })
  }
}
