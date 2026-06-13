// src/app/categories/page.tsx
export const dynamic = 'force-dynamic'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { CATEGORIES, CATEGORY_FAMILIES, getCategoriesByFamily } from '@/lib/categories'

export const metadata = {
  title: 'Toutes les catégories — Cultupedia',
  description: 'Explorez les 17 catégories du patrimoine culturel haïtien sur Cultupedia.',
}

export default function CategoriesOverviewPage() {
  return (
    <>
      <Navbar lang="fr" />
      <main className="pt-24 pb-20">
        <div className="section">

          {/* Header */}
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <div className="text-xs font-semibold text-brand-rouge uppercase tracking-widest mb-3">Explorer</div>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-[#1A1A24] mb-4">
              Toutes les catégories
            </h1>
            <p className="text-[#5A5A6E] text-lg">
              {CATEGORIES.length} catégories couvrant l'ensemble du patrimoine culturel haïtien —
              du patrimoine vivant aux industries créatives.
            </p>
          </div>

          {/* Familles */}
          {CATEGORY_FAMILIES.map(family => (
            <section key={family.id} className="mb-14">
              <h2 className="font-display font-bold text-xl text-[#1A1A24] mb-6 flex items-center gap-3">
                <span className="w-1.5 h-6 rounded-full bg-brand-rouge inline-block" />
                {family.label.fr}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {getCategoriesByFamily(family.id).map(cat => (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.id}`}
                    className="group card p-6 hover:-translate-y-1 transition-transform"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                        style={{ background: `${cat.color}15` }}
                      >
                        {cat.emoji}
                      </div>
                      <div className="min-w-0">
                        <h3
                          className="font-display font-bold text-base mb-1.5 leading-tight group-hover:text-brand-rouge transition-colors"
                          style={{ color: cat.color }}
                        >
                          {cat.label.fr}
                        </h3>
                        <p className="text-xs text-[#9090A8] leading-relaxed line-clamp-2">
                          {cat.description.fr}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}

          {/* CTA recherche */}
          <div className="text-center mt-12 pt-12 border-t border-black/[0.06]">
            <p className="text-[#5A5A6E] mb-4">Vous ne trouvez pas ce que vous cherchez ?</p>
            <Link href="/search" className="btn-primary px-8 py-3.5 rounded-2xl">
              Recherche avancée →
            </Link>
          </div>
        </div>
      </main>
      <Footer lang="fr" />
    </>
  )
}
