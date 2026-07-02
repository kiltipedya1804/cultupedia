// src/app/newsletter/confirmed/page.tsx
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { CheckCircle } from 'lucide-react'

export default function NewsletterConfirmedPage() {
  return (
    <>
      <Navbar lang="fr" />
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="font-display font-bold text-3xl text-[#1A1A24] mb-3">
            Inscription confirmée ! 🇭🇹
          </h1>
          <p className="text-[#5A5A6E] mb-8">
            Vous êtes maintenant abonné à la newsletter Cultupedia. Vous recevrez les actualités de la culture haïtienne directement dans votre boîte mail.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="btn-primary">Explorer Cultupedia</Link>
            <Link href="/contribute" className="btn-secondary">Contribuer</Link>
          </div>
        </div>
      </main>
      <Footer lang="fr" />
    </>
  )
}
