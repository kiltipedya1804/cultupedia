'use client'
// src/components/layout/Footer.tsx
import Link from 'next/link'
import { DISCIPLINES, SITE_CONFIG } from '@/lib/config'
import { useTranslations } from '@/i18n/translations'
import type { Lang } from '@/types'

export default function Footer({ lang = 'fr' }: { lang?: Lang }) {
  const t = useTranslations(lang)
  const year = new Date().getFullYear()

  return (
    <footer className="bg-brand-noir text-white/80 mt-24">
      <div className="section py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Marque */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg overflow-hidden flex flex-col">
                <div className="flex-1 bg-brand-bleu-mid" />
                <div className="flex-1 bg-brand-rouge" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                Cultu<span className="text-brand-rouge">pedia</span>
              </span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed max-w-sm">
              {t.footer.tagline}
            </p>
            <div className="flex gap-3 mt-6">
              {(['fr','ht','en'] as Lang[]).map(l => (
                <button
                  key={l}
                  className={`text-xs font-semibold uppercase px-3 py-1.5 rounded-lg transition-colors ${
                    l === lang
                      ? 'bg-brand-rouge text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  {l === 'ht' ? 'HT' : l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Disciplines */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">
              Disciplines
            </h4>
            <ul className="space-y-2">
              {DISCIPLINES.map(d => (
                <li key={d.id}>
                  <Link
                    href={`/categories/${d.id}`}
                    className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span>{d.emoji}</span>
                    {d.label[lang]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Liens */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">
              Cultupedia
            </h4>
            <ul className="space-y-2">
              {[
                { href: '/search',  label: t.nav.search },
                { href: '/about',   label: t.nav.about  },
                { href: '/contact', label: t.nav.contact },
                { href: '/admin',   label: t.nav.admin   },
              ].map(item => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            © {year} Cultupedia. {t.footer.rights}
          </p>
          <p className="text-xs text-white/40">{t.footer.made_with}</p>
        </div>
      </div>
    </footer>
  )
}
