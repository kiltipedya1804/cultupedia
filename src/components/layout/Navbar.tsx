'use client'
// src/components/layout/Navbar.tsx
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Search, Menu, X, Globe, ChevronDown } from 'lucide-react'
import { DISCIPLINES, SITE_CONFIG } from '@/lib/config'
import { useTranslations } from '@/i18n/translations'
import type { Lang } from '@/types'
import { cn } from '@/lib/utils'

interface NavbarProps {
  lang?: Lang
}

export default function Navbar({ lang = 'fr' }: NavbarProps) {
  const t = useTranslations(lang)
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [discOpen, setDiscOpen] = useState(false)
  const [user, setUser] = useState<{ full_name: string | null; email: string } | null>(null)

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', handle, { passive: true })
    return () => window.removeEventListener('scroll', handle)
  }, [])

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.user) setUser(data.user) })
      .catch(() => {})
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/')
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQ.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQ.trim())}`)
      setSearchOpen(false)
      setSearchQ('')
    }
  }

  const langs: { code: Lang; label: string }[] = [
    { code: 'fr', label: 'Français' },
    { code: 'ht', label: 'Kreyòl' },
    { code: 'en', label: 'English' },
  ]

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-black/[0.06]'
            : 'bg-transparent'
        )}
      >
        <nav className="section">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex items-center">
                {/* Drapeau haïtien stylisé */}
                <div className="w-8 h-8 rounded-lg overflow-hidden flex flex-col shadow-sm">
                  <div className="flex-1 bg-brand-bleu" />
                  <div className="flex-1 bg-brand-rouge" />
                </div>
              </div>
              <span className="font-display font-bold text-xl text-brand-noir tracking-tight">
                Cultu<span className="text-brand-rouge">pedia</span>
              </span>
            </Link>

            {/* Nav desktop */}
            <div className="hidden lg:flex items-center gap-1">

              {/* Dropdown disciplines */}
              <div className="relative" onMouseLeave={() => setDiscOpen(false)}>
                <button
                  onMouseEnter={() => setDiscOpen(true)}
                  onClick={() => setDiscOpen(!discOpen)}
                  className={cn(
                    'btn-ghost gap-1',
                    discOpen && 'bg-black/5'
                  )}
                >
                  Explorer
                  <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', discOpen && 'rotate-180')} />
                </button>

                {discOpen && (
                  <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-2xl shadow-xl border border-black/[0.08] p-2 animate-fade-in z-50">
                    {DISCIPLINES.map(disc => (
                      <Link
                        key={disc.id}
                        href={`/categories/${disc.id}`}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/[0.04] transition-colors group"
                        onClick={() => setDiscOpen(false)}
                      >
                        <span className="text-xl">{disc.emoji}</span>
                        <div>
                          <div className="font-semibold text-sm text-[#1A1A24] group-hover:text-brand-rouge transition-colors">
                            {disc.label[lang]}
                          </div>
                          <div className="text-xs text-[#9090A8] mt-0.5">{disc.description[lang]}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link href="/search" className={cn('btn-ghost', pathname === '/search' && 'text-brand-rouge')}>
                {t.nav.search}
              </Link>
              <Link href="/profiles" className={cn('btn-ghost', pathname === '/profiles' && 'text-brand-rouge')}>
                Profils
              </Link>
              <Link href="/about" className={cn('btn-ghost', pathname === '/about' && 'text-brand-rouge')}>
                {t.nav.about}
              </Link>
              <Link href="/contact" className={cn('btn-ghost', pathname === '/contact' && 'text-brand-rouge')}>
                {t.nav.contact}
              </Link>
            </div>

            {/* Actions droite */}
            <div className="flex items-center gap-2">
              {/* Recherche rapide */}
              <button
                onClick={() => setSearchOpen(true)}
                className="btn-ghost p-2.5 rounded-xl"
                aria-label="Rechercher"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Contribuer */}
              <Link href="/contribute" className="hidden md:flex btn-primary text-sm py-2 px-4">
                + Contribuer
              </Link>

              {/* Auth */}
              {user ? (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/dashboard" className="btn-ghost text-sm py-2 px-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-rouge text-white text-xs flex items-center justify-center font-bold">
                      {(user.full_name ?? user.email).charAt(0).toUpperCase()}
                    </span>
                    {user.full_name ?? 'Mon espace'}
                  </Link>
                  <button onClick={handleLogout} className="btn-ghost text-sm py-2 px-4 text-[#9090A8] hover:text-brand-rouge">
                    Déconnexion
                  </button>
                </div>
              ) : (
                <Link href="/auth" className="hidden md:flex btn-ghost text-sm py-2 px-4">
                  Connexion
                </Link>
              )}

              {/* Langue */}
              <div className="relative group hidden md:block">
                <button className="btn-ghost p-2.5 rounded-xl flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase">{lang}</span>
                </button>
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-black/[0.08] py-1 hidden group-hover:block w-36 z-50">
                  {langs.map(l => (
                    <Link
                      key={l.code}
                      href={`/${l.code}`}
                      className={cn(
                        'flex items-center px-4 py-2 text-sm hover:bg-black/[0.04] transition-colors',
                        l.code === lang ? 'text-brand-rouge font-semibold' : 'text-[#3A3A50]'
                      )}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Menu mobile */}
              <button
                onClick={() => setOpen(!open)}
                className="lg:hidden btn-ghost p-2.5 rounded-xl"
                aria-label="Menu"
              >
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Menu mobile */}
        {open && (
          <div className="lg:hidden bg-white border-t border-black/[0.06] animate-fade-in">
            <div className="section py-4 space-y-1">
              <div className="px-4 py-2 text-xs font-semibold text-[#9090A8] uppercase tracking-widest">
                Disciplines
              </div>
              {DISCIPLINES.map(disc => (
                <Link
                  key={disc.id}
                  href={`/categories/${disc.id}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/[0.04] transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <span>{disc.emoji}</span>
                  <span className="font-medium text-sm">{disc.label[lang]}</span>
                </Link>
              ))}
              <div className="border-t border-black/[0.06] pt-2 mt-2 space-y-1">
                <Link href="/search"  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/[0.04]" onClick={() => setOpen(false)}>
                  <Search className="w-4 h-4 text-[#9090A8]" />
                  <span className="text-sm font-medium">{t.nav.search}</span>
                </Link>
                <Link href="/profiles" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/[0.04]" onClick={() => setOpen(false)}>
                  <span className="w-4 h-4 text-[#9090A8] text-center">👤</span>
                  <span className="text-sm font-medium">Profils</span>
                </Link>
                <Link href="/contribute" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/[0.04]" onClick={() => setOpen(false)}>
                  <span className="w-4 h-4 text-[#9090A8] text-center">✚</span>
                  <span className="text-sm font-medium">Contribuer</span>
                </Link>
                {user ? (
                  <>
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/[0.04]" onClick={() => setOpen(false)}>
                      <span className="w-4 h-4 text-[#9090A8] text-center">👤</span>
                      <span className="text-sm font-medium">Mon espace</span>
                    </Link>
                    <button onClick={() => { handleLogout(); setOpen(false) }} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/[0.04] w-full text-left">
                      <span className="w-4 h-4 text-[#9090A8] text-center">→</span>
                      <span className="text-sm font-medium text-[#9090A8]">Déconnexion</span>
                    </button>
                  </>
                ) : (
                  <Link href="/auth" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/[0.04]" onClick={() => setOpen(false)}>
                    <span className="w-4 h-4 text-[#9090A8] text-center">→</span>
                    <span className="text-sm font-medium">Connexion</span>
                  </Link>
                )}
                <Link href="/about"   className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/[0.04]" onClick={() => setOpen(false)}>
                  <span className="w-4 h-4 text-[#9090A8] text-center">ℹ</span>
                  <span className="text-sm font-medium">{t.nav.about}</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Overlay recherche rapide */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-24 px-4 animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
        >
          <div className="w-full max-w-2xl animate-fade-up">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9090A8]" />
              <input
                autoFocus
                type="text"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder={t.search.placeholder}
                className="search-input pr-24"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 btn-primary py-2 px-4 text-sm"
              >
                Chercher
              </button>
            </form>
            <div className="mt-3 flex flex-wrap gap-2 px-1">
              {DISCIPLINES.map(d => (
                <Link
                  key={d.id}
                  href={`/categories/${d.id}`}
                  className="tag"
                  onClick={() => setSearchOpen(false)}
                >
                  {d.emoji} {d.label[lang]}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
