// src/app/not-found.tsx
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function NotFound() {
  return (
    <>
      <Navbar lang="fr" />
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <div className="font-display font-bold text-[120px] leading-none text-brand-rouge/15 select-none">
            404
          </div>
          <h1 className="font-display font-bold text-3xl text-[#1A1A24] -mt-4 mb-4">
            Page introuvable
          </h1>
          <p className="text-[#5A5A6E] mb-8">
            Cette page n'existe pas ou a été déplacée.
            Retournez à l'accueil ou effectuez une recherche.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/"       className="btn-primary">← Accueil</Link>
            <Link href="/search" className="btn-secondary">Rechercher</Link>
          </div>
        </div>
      </main>
      <Footer lang="fr" />
    </>
  )
}
