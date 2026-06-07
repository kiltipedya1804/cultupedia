// src/app/about/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, Globe, Users, Heart, ArrowRight } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { DISCIPLINES } from '@/lib/config'

export const metadata: Metadata = {
  title: 'À propos — Cultupedia',
  description: "L'encyclopédie vivante de la culture haïtienne — mission, vision et équipe.",
}

export default function AboutPage() {
  const values = [
    { icon: BookOpen, title: 'Documenter', desc: "Cataloguer chaque expression culturelle haïtienne, des origines à aujourd'hui, pour en assurer la pérennité numérique." },
    { icon: Globe,    title: 'Partager',   desc: "Rendre cette mémoire accessible à tous — en Haïti, dans la diaspora, et partout dans le monde — en trois langues." },
    { icon: Users,    title: 'Connecter',  desc: "Relier les artistes, les institutions, les communautés et les chercheurs autour d'un patrimoine commun." },
    { icon: Heart,    title: 'Célébrer',   desc: "Honorer la richesse et la diversité d'une culture qui rayonne bien au-delà des frontières de l'île." },
  ]

  return (
    <>
      <Navbar lang="fr" />
      <main className="pt-20 pb-20">

        {/* Hero */}
        <section className="relative py-24 overflow-hidden bg-brand-noir">
          <div className="absolute left-0 top-0 h-full w-1.5 flex flex-col">
            <div className="flex-1 bg-brand-bleu-mid" />
            <div className="flex-1 bg-brand-rouge" />
          </div>
          <div className="absolute -right-32 top-0 w-96 h-96 rounded-full bg-brand-rouge/10 blur-3xl" />
          <div className="section relative z-10 text-center">
            <div className="text-xs font-semibold text-brand-or uppercase tracking-widest mb-4">
              Kiltipedya · Cultupedia
            </div>
            <h1 className="font-display font-bold text-white text-4xl md:text-5xl mb-6">
              À propos de{' '}
              <span className="text-brand-rouge">Cultupedia</span>
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
              L'encyclopédie numérique, vivante et multilingue de la culture haïtienne —
              musique, danse, cinéma, arts visuels, théâtre, gastronomie et édition.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20">
          <div className="section">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="text-xs font-semibold text-brand-rouge uppercase tracking-widest mb-3">Notre mission</div>
                <h2 className="font-display font-bold text-3xl text-[#1A1A24] mb-6">
                  Préserver la mémoire culturelle haïtienne
                </h2>
                <div className="space-y-4 text-[#5A5A6E] leading-relaxed">
                  <p>
                    Cultupedia est né d'un constat simple : la culture haïtienne, l'une des plus riches
                    et des plus influentes de la Caraïbe, souffre d'un manque cruel de documentation
                    numérique structurée. Des milliers d'artistes, de groupes, de festivals, d'institutions
                    et d'œuvres n'ont aucune présence organisée en ligne.
                  </p>
                  <p>
                    Notre mission est de combler ce vide en construisant la référence encyclopédique
                    de la culture haïtienne — exhaustive, accessible, multilingue, et ouverte à tous.
                    Plus de <strong className="text-[#1A1A24]">100 000 entrées</strong> couvrent
                    7 disciplines, de 1800 à aujourd'hui, en Haïti et dans toute la diaspora mondiale.
                  </p>
                  <p>
                    Cultupedia est un outil souverain : haïtien, pour les Haïtiens, par les Haïtiens —
                    et pour quiconque veut comprendre, célébrer et partager cette culture extraordinaire.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {values.map((v, i) => (
                  <div key={i} className="card p-6">
                    <div className="w-11 h-11 rounded-xl bg-brand-rouge/10 flex items-center justify-center mb-4">
                      <v.icon className="w-5 h-5 text-brand-rouge" />
                    </div>
                    <h3 className="font-display font-bold text-base text-[#1A1A24] mb-2">{v.title}</h3>
                    <p className="text-sm text-[#5A5A6E] leading-relaxed">{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Chiffres */}
        <section className="py-16 bg-brand-creme-dark/50">
          <div className="section">
            <div className="text-center mb-12">
              <div className="text-xs font-semibold text-brand-rouge uppercase tracking-widest mb-2">En chiffres</div>
              <h2 className="font-display font-bold text-3xl text-[#1A1A24]">La base de données</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { val: '103 000+', label: 'Entrées culturelles' },
                { val: '7',        label: 'Disciplines' },
                { val: '3',        label: 'Langues (FR · HT · EN)' },
                { val: '7',        label: 'Régions du monde' },
              ].map((s, i) => (
                <div key={i} className="stat-card text-center">
                  <div className="font-display font-bold text-3xl text-brand-rouge mb-1">{s.val}</div>
                  <div className="text-sm text-[#9090A8]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Disciplines */}
        <section className="py-20">
          <div className="section">
            <div className="text-center mb-12">
              <div className="text-xs font-semibold text-brand-rouge uppercase tracking-widest mb-2">Périmètre</div>
              <h2 className="font-display font-bold text-3xl text-[#1A1A24]">7 disciplines culturelles</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
              {DISCIPLINES.map(d => (
                <Link key={d.id} href={`/categories/${d.id}`}
                      className="card p-5 text-center hover:-translate-y-1 group">
                  <div className="text-3xl mb-3">{d.emoji}</div>
                  <div className="font-semibold text-sm group-hover:transition-colors" style={{ color: d.color }}>
                    {d.label.fr}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-brand-noir relative overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-1.5 flex flex-col">
            <div className="flex-1 bg-brand-rouge" />
            <div className="flex-1 bg-brand-or" />
          </div>
          <div className="section text-center relative z-10">
            <h2 className="font-display font-bold text-3xl text-white mb-4">
              Explorez la base de données
            </h2>
            <p className="text-white/60 mb-8 max-w-lg mx-auto">
              Plus de 100 000 entrées vous attendent — artistes, groupes, festivals,
              institutions, lieux culturels et bien plus.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/search" className="btn-primary px-8 py-4 text-base rounded-2xl">
                <ArrowRight className="w-5 h-5" /> Explorer
              </Link>
              <Link href="/contact" className="btn-secondary px-8 py-4 text-base rounded-2xl border-white/20 text-white hover:bg-white/10">
                Nous contacter
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer lang="fr" />
    </>
  )
}
