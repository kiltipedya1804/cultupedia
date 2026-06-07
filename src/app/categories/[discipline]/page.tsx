// src/app/categories/[discipline]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { DISCIPLINE_MAP, DISCIPLINES } from '@/lib/config'
import { getEntriesByDiscipline } from '@/lib/db'
import EntryCard from '@/components/profile/EntryCard'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import type { Discipline } from '@/types'

interface Props { params: { discipline: string } }

export async function generateStaticParams() {
  return DISCIPLINES.map(d => ({ discipline: d.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const disc = DISCIPLINE_MAP[params.discipline as Discipline]
  if (!disc) return { title: 'Catégorie introuvable' }
  return {
    title: `${disc.label.fr} — Cultupedia`,
    description: disc.description.fr,
  }
}

export default async function CategoryPage({ params }: Props) {
  const disc = DISCIPLINE_MAP[params.discipline as Discipline]
  if (!disc) notFound()

  const { entries, total } = await getEntriesByDiscipline(params.discipline as Discipline, 24)

  return (
    <>
      <Navbar lang="fr" />
      <main className="pt-20 pb-20">

        {/* Hero discipline */}
        <div className="relative overflow-hidden py-20 mb-12" style={{ background: `${disc.color}08` }}>
          <div className="absolute left-0 top-0 h-full w-1.5" style={{ background: disc.color }} />
          <div className="section">
            <div className="flex items-center gap-2 text-sm text-[#9090A8] mb-6">
              <Link href="/" className="hover:text-brand-rouge transition-colors">Accueil</Link>
              <span>/</span>
              <span style={{ color: disc.color }} className="font-medium">{disc.label.fr}</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl flex-shrink-0"
                   style={{ background: `${disc.color}15` }}>
                {disc.emoji}
              </div>
              <div>
                <h1 className="font-display font-bold text-4xl md:text-5xl" style={{ color: disc.color }}>
                  {disc.label.fr}
                </h1>
                <p className="text-[#5A5A6E] mt-2 text-lg">{disc.description.fr}</p>
                <p className="text-sm text-[#9090A8] mt-2">
                  <strong className="text-[#1A1A24]">{total.toLocaleString('fr')}</strong> entrées disponibles
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="section">
          {/* Autres disciplines */}
          <div className="flex flex-wrap gap-2 mb-10">
            {DISCIPLINES.filter(d => d.id !== params.discipline).map(d => (
              <Link key={d.id} href={`/categories/${d.id}`}
                    className="tag text-xs">
                {d.emoji} {d.label.fr}
              </Link>
            ))}
          </div>

          {/* Grille entrées */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {entries.map(entry => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>

          {total > 24 && (
            <div className="text-center mt-12">
              <Link
                href={`/search?discipline=${params.discipline}`}
                className="btn-primary px-10 py-4 text-base rounded-2xl"
              >
                Voir les {total.toLocaleString('fr')} entrées →
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer lang="fr" />
    </>
  )
}
