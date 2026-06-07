// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'

const SUPPORTED_LANGS = ['fr', 'ht', 'en']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const segments = pathname.split('/').filter(Boolean)
  const lang = segments[0]

  if (SUPPORTED_LANGS.includes(lang)) {
    // /fr, /ht, /en → redirige vers / avec cookie lang
    const rest = '/' + segments.slice(1).join('/')
    const cleanPath = rest === '/' ? '/' : rest

    const url = request.nextUrl.clone()
    url.pathname = cleanPath

    const response = NextResponse.redirect(url)
    response.cookies.set('lang', lang, { path: '/', maxAge: 60 * 60 * 24 * 365 })
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|entry|categories|search|about|contact|admin|auth|validate).*)'],
}
