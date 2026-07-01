// src/app/page.tsx
export const revalidate = 3600
import Link from 'next/link'
import { Suspense } from 'react'
import { Search, ArrowRight, Globe, BookOpen, Users } from 'lucide-react'
import { getFeaturedEntries, getRecentEntries, getGlobalStats } from '@/lib/db'
import { DISCIPLINES, DISCIPLINE_MAP } from '@/lib/config'
import EntryCard from '@/components/profile/EntryCard'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FadeIn from '@/components/FadeIn'
import AnimatedCounter from '@/components/AnimatedCounter'
import { StaggerGrid, StaggerItem } from '@/components/StaggerGrid'
import type { Discipline } from '@/types'

async function HeroStats() {
  const stats = await getGlobalStats()
  const items = [
    { value: stats.total,        label: 'entrées culturelles', icon: BookOpen, suffix: '' },
    { value: 17,                 label: 'catégories',          icon: Globe,    suffix: '' },
    { value: stats.countries,    label: 'pays couverts',       icon: Globe,    suffix: '' },
    { value: 200,                label: 'années d\'histoire',  icon: Users,    suffix: '+' },
  ]
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
      {items.map((item, i) => (
        <div key={i} className="stat-card text-center">
          <div className="font-display font-bold text-2xl md:text-3xl text-brand-rouge">
            <AnimatedCounter value={item.value} suffix={item.suffix} duration={1.8} />
          </div>
          <div className="text-xs text-[#9090A8] mt-1">{item.label}</div>
        </div>
      ))}
    </div>
  )
}

async function FeaturedSection() {
  const entries = await getFeaturedEntries(6)
  return (
    <section className="py-20">
      <div className="section">
        <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-xs font-semibold text-brand-rouge uppercase tracking-widest mb-2">À la une</div>
              <h2 className="font-display text-3xl font-bold text-[#1A1A24]">Entrées en vedette</h2>
            </div>
            <Link href="/search?featured=true" className="btn-ghost text-sm hidden md:flex">
              Voir tout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map((entry, i) => (
            <StaggerItem key={entry.id}>
              <EntryCard entry={entry} priority={i < 3} />
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  )
}

async function RecentSection() {
  const entries = await getRecentEntries(12)
  return (
    <section className="py-12 bg-brand-creme-dark/50">
      <div className="section">
        <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-xs font-semibold text-brand-bleu uppercase tracking-widest mb-2">Découvrir</div>
              <h2 className="font-display text-2xl font-bold text-[#1A1A24]">Dernières entrées</h2>
            </div>
            <Link href="/search" className="btn-ghost text-sm hidden md:flex">
              Tout explorer <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {entries.map(entry => (
            <StaggerItem key={entry.id}>
              <EntryCard entry={entry} />
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  )
}

function DisciplinesGrid() {
  return (
    <section className="py-20">
      <div className="section">
        <FadeIn>
          <div className="text-center mb-12">
            <div className="text-xs font-semibold text-brand-rouge uppercase tracking-widest mb-2">Explorer</div>
            <h2 className="font-display text-3xl font-bold text-[#1A1A24]">Par discipline</h2>
            <p className="text-[#5A5A6E] mt-3 max-w-lg mx-auto">
              Naviguez à travers les 17 catégories de la culture haïtienne.
            </p>
          </div>
        </FadeIn>
        <StaggerGrid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {DISCIPLINES.map((disc) => (
            <StaggerItem key={disc.id}>
              <Link
                href={`/categories/${disc.id}`}
                className="group card p-6 text-center hover:-translate-y-2 transition-transform duration-300 block"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                  style={{ background: `${disc.color}15` }}
                >
                  {disc.emoji}
                </div>
                <div
                  className="font-display font-bold text-base mb-1 group-hover:transition-colors"
                  style={{ color: disc.color }}
                >
                  {disc.label.fr}
                </div>
                <div className="text-xs text-[#9090A8] leading-relaxed">
                  {disc.description.fr.split(',')[0]}...
                </div>
              </Link>
            </StaggerItem>
          ))}
          <StaggerItem>
            <Link
              href="/categories"
              className="group card p-6 text-center hover:-translate-y-2 transition-transform duration-300 border-dashed block"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 bg-black/[0.04] group-hover:bg-brand-rouge/10 transition-colors">
                🔍
              </div>
              <div className="font-display font-bold text-base mb-1 text-[#5A5A6E] group-hover:text-brand-rouge transition-colors">
                Tout explorer
              </div>
              <div className="text-xs text-[#9090A8]">Recherche avancée</div>
            </Link>
          </StaggerItem>
        </StaggerGrid>
      </div>
    </section>
  )
}

function SearchBanner() {
  return (
    <section className="py-20 bg-brand-noir relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-pattern opacity-30" />
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand-rouge via-brand-or to-brand-bleu" />

      <div className="section relative z-10 text-center">
        <FadeIn>
          <div className="text-xs font-semibold text-brand-or uppercase tracking-widest mb-4">Recherche</div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Trouvez n'importe quelle entrée
          </h2>
          <p className="text-white/60 mb-10 max-w-lg mx-auto">
            Par nom, discipline, ville, pays, tag — 122 000+ entrées indexées.
          </p>
          <Link href="/search" className="btn-primary text-base px-8 py-4 rounded-2xl inline-flex hover:scale-105 transition-transform">
            <Search className="w-5 h-5" />
            Recherche avancée
          </Link>
        </FadeIn>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <Navbar lang="fr" />

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-haitian-pattern pt-20">
        <div className="absolute left-0 top-0 h-full w-1.5 flex flex-col">
          <div className="flex-1 bg-brand-bleu" />
          <div className="flex-1 bg-brand-rouge" />
        </div>

        <div className="absolute -right-40 -top-40 w-[600px] h-[600px] rounded-full bg-brand-rouge/[0.04] blur-3xl pointer-events-none animate-pulse-slow" />
        <div className="absolute -left-20 -bottom-20 w-[400px] h-[400px] rounded-full bg-brand-bleu/[0.05] blur-3xl pointer-events-none animate-pulse-slow" />

        <div className="section py-20 relative z-10">
          <div className="max-w-4xl">
            <FadeIn delay={0}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-rouge/10 border border-brand-rouge/20 text-brand-rouge text-sm font-semibold mb-8">
                <span className="w-2 h-2 rounded-full bg-brand-rouge animate-pulse" />
                Kiltipedya — L'encyclopédie vivante
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="font-display font-bold text-[#1A1A24] text-4xl md:text-6xl leading-tight">
                La mémoire{' '}
                <span className="text-gradient">culturelle haïtienne</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="text-xl text-[#5A5A6E] mt-6 max-w-2xl leading-relaxed">
                L'encyclopédie numérique de la culture haïtienne — musique, danse, cinéma,
                arts visuels, théâtre, gastronomie et édition. Plus de 122 000 entrées,
                accessibles à tous.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <form action="/search" method="get" className="mt-10 flex gap-3 max-w-2xl">
                <div className="relative flex-1">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9090A8]" />
                  <input
                    name="q"
                    type="text"
                    placeholder="Tabou Combo, Jacmel, compas..."
                    className="search-input py-5 text-lg"
                  />
                </div>
                <button type="submit" className="btn-primary px-8 py-5 text-base rounded-2xl hover:scale-105 transition-transform">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="flex flex-wrap gap-2 mt-6">
                {DISCIPLINES.slice(0, 5).map(d => (
                  <Link key={d.id} href={`/categories/${d.id}`} className="tag hover:scale-105 transition-transform">
                    {d.emoji} {d.label.fr}
                  </Link>
                ))}
                <Link href="/categories" className="tag font-medium hover:scale-105 transition-transform">
                  + Explorer tout →
                </Link>
              </div>
            </FadeIn>
          </div>

          <Suspense fallback={<div className="mt-12 h-24 skeleton" />}>
            <HeroStats />
          </Suspense>
        </div>
      </section>

      <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="skeleton w-full h-full" /></div>}>
        <FeaturedSection />
      </Suspense>

      <DisciplinesGrid />

      <Suspense fallback={<div className="h-72" />}>
        <RecentSection />
      </Suspense>

      <SearchBanner />

      <Footer lang="fr" />
    </>
  )
}
