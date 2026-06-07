// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'

const SUPPORTED_LANGS = ['fr', 'ht', 'en']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Vérifie si le chemin commence par une langue supportée ex: /ht, /ht/search
  const segments = pathname.split('/')
  const lang = segments[1]

  if (SUPPORTED_LANGS.includes(lang)) {
    // Redirige /ht/search → /search, /fr → /
    const rest = '/' + segments.slice(2).join('/')
    const cleanPath = rest === '/' ? '/' : rest.replace(/\/$/, '') || '/'
    
    // Garder le lang dans un cookie pour que le site sache quelle langue afficher
    const response = NextResponse.redirect(new URL(cleanPath, request.url))
    response.cookies.set('lang', lang, { path: '/', maxAge: 60 * 60 * 24 * 365 })
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}
