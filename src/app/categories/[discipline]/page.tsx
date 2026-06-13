// src/app/categories/[discipline]/page.tsx
export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { CATEGORY_MAP, CATEGORIES } from '@/lib/categories'
import { getEntriesByCategory } from '@/lib/db'
import EntryCard from '@/components/profile/EntryCard'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

interface Props { params: { discipline: string } }

export async function generateStaticParams() {
  return CATEGORIES.map(c => ({ discipline: c.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = CATEGORY_MAP[params.discipline]
  if (!cat) return { title: 'Catégorie introuvable' }
  return {
    title: `${cat.label.fr} — Cultupedia`,
    description: cat.description.fr,
  }
}

export default async function CategoryPage({ params }: Props) {
  const cat = CATEGORY_MAP[params.discipline]
  if (!cat) notFound()

  const { entries, total } = await getEntriesByCategory(params.discipline, 24)

  return (
    <>
      <Navbar lang="fr" />
      <main className="pt-20 pb-20">

        {/* Hero catégorie */}
        <div className="relative overflow-hidden py-20 mb-12" style={{ background: `${cat.color}08` }}>
          <div className="absolute left-0 top-0 h-full w-1.5" style={{ background: cat.color }} />
          <div className="section">
            <div className="flex items-center gap-2 text-sm text-[#9090A8] mb-6">
              <Link href="/" className="hover:text-brand-rouge transition-colors">Accueil</Link>
              <span>/</span>
              <Link href="/categories" className="hover:text-brand-rouge transition-colors">Catégories</Link>
              <span>/</span>
              <span style={{ color: cat.color }} className="font-medium">{cat.label.fr}</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl flex-shrink-0"
                   style={{ background: `${cat.color}15` }}>
                {cat.emoji}
              </div>
              <div>
                <h1 className="font-display font-bold text-3xl md:text-4xl leading-tight" style={{ color: cat.color }}>
                  {cat.label.fr}
                </h1>
                <p className="text-[#5A5A6E] mt-2 text-base max-w-2xl">{cat.description.fr}</p>
                <p className="text-sm text-[#9090A8] mt-2">
                  <strong className="text-[#1A1A24]">{total.toLocaleString('fr')}</strong> entrées disponibles
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="section">
          {/* Autres catégories */}
          <div className="flex flex-wrap gap-2 mb-10">
            {CATEGORIES.filter(c => c.id !== params.discipline).map(c => (
              <Link key={c.id} href={`/categories/${c.id}`} className="tag text-xs">
                {c.emoji} {c.label.fr}
              </Link>
            ))}
          </div>

          {/* Grille entrées */}
          {entries.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">{cat.emoji}</div>
              <h3 className="font-display font-bold text-xl text-[#1A1A24] mb-2">
                Aucune entrée pour le moment
              </h3>
              <p className="text-[#9090A8] mb-6">
                Soyez le premier à contribuer à cette catégorie !
              </p>
              <Link href="/contribute" className="btn-primary">Contribuer →</Link>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </main>
      <Footer lang="fr" />
    </>
  )
}
