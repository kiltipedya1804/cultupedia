'use client'
// src/app/dashboard/page.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { User, Plus, BookOpen, Clock, CheckCircle, XCircle, LogOut } from 'lucide-react'

const ROLE_LABELS: Record<string, string> = {
  artiste_musicien: 'Artiste / Musicien / Danseur',
  cineaste_acteur: 'Cinéaste / Acteur',
  ecrivain_auteur: 'Écrivain / Auteur',
  responsable_culturel: 'Responsable culturel',
  gastronome_chef: 'Gastronome / Chef',
  journaliste: 'Journaliste / Média',
  contributeur: 'Contributeur général',
  fan: 'Fan / Passionné de culture haïtienne',
}

interface UserData {
  id: string
  email: string
  full_name: string | null
  role: string
  role_label: string | null
  verified: boolean
}

interface Contribution {
  id: string
  nom: string
  type: string
  discipline: string
  status: string
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) { router.push('/auth'); return null }
        return res.json()
      })
      .then(data => {
        if (data) {
          setUser(data.user)
          setContributions(data.contributions ?? [])
        }
      })
      .finally(() => setLoading(false))
  }, [router])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  if (loading) {
    return (
      <>
        <Navbar lang="fr" />
        <main className="pt-24 pb-20 min-h-screen">
          <div className="section max-w-4xl">
            <div className="skeleton h-48 rounded-2xl mb-6" />
            <div className="skeleton h-32 rounded-2xl" />
          </div>
        </main>
      </>
    )
  }

  if (!user) return null

  const roleLabel = user.role_label ? (ROLE_LABELS[user.role_label] ?? user.role_label) : null

  return (
    <>
      <Navbar lang="fr" />
      <main className="pt-24 pb-20">
        <div className="section max-w-4xl">

          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="text-xs font-semibold text-brand-rouge uppercase tracking-widest mb-2">Mon espace</div>
              <h1 className="font-display font-bold text-3xl text-[#1A1A24]">
                Bonjour, {user.full_name ?? 'Utilisateur'} 👋
              </h1>
              {roleLabel && (
                <p className="text-[#5A5A6E] mt-1 text-sm">{roleLabel}</p>
              )}
            </div>
            <button onClick={logout}
              className="btn-ghost text-sm flex items-center gap-2 text-[#9090A8] hover:text-brand-rouge">
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Profil */}
            <div className="lg:col-span-1 space-y-5">
              <div className="card p-6">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-brand-rouge/10 flex items-center justify-center text-2xl flex-shrink-0">
                    👤
                  </div>
                  <div>
                    <div className="font-display font-bold text-[#1A1A24]">{user.full_name ?? 'Utilisateur'}</div>
                    <div className="text-xs text-[#9090A8] mt-0.5">{user.email}</div>
                    {user.verified && (
                      <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
                        <CheckCircle className="w-3 h-3" /> Compte vérifié
                      </div>
                    )}
                  </div>
                </div>

                {roleLabel && (
                  <div className="bg-brand-rouge/[0.04] rounded-xl p-3 mb-4 border border-brand-rouge/10">
                    <div className="text-xs font-semibold text-brand-rouge">{roleLabel}</div>
                  </div>
                )}

                <div className="space-y-2">
                  <Link href="/contribute" className="btn-primary w-full justify-center py-2.5 text-sm">
                    <Plus className="w-4 h-4" /> Soumettre une entrée
                  </Link>
                  <Link href="/profile/create" className="btn-secondary w-full justify-center py-2.5 text-sm">
                    <User className="w-4 h-4" /> Créer mon profil public
                  </Link>
                </div>
              </div>

              {/* Stats */}
              <div className="card p-6">
                <h3 className="font-semibold text-sm text-[#1A1A24] mb-4">Mes statistiques</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#5A5A6E]">Contributions soumises</span>
                    <span className="font-bold text-[#1A1A24]">{contributions.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#5A5A6E]">Approuvées</span>
                    <span className="font-bold text-emerald-600">
                      {contributions.filter(c => c.status === 'approved').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#5A5A6E]">En attente</span>
                    <span className="font-bold text-amber-500">
                      {contributions.filter(c => c.status === 'pending').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contributions */}
            <div className="lg:col-span-2">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display font-bold text-xl text-[#1A1A24]">Mes contributions</h2>
                  <Link href="/contribute" className="btn-ghost text-sm">
                    <Plus className="w-4 h-4" /> Nouvelle
                  </Link>
                </div>

                {contributions.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-[#9090A8] mx-auto mb-3 opacity-40" />
                    <h3 className="font-semibold text-[#1A1A24] mb-1">Aucune contribution</h3>
                    <p className="text-sm text-[#9090A8] mb-6">
                      Contribuez à l'encyclopédie culturelle haïtienne
                    </p>
                    <Link href="/contribute" className="btn-primary text-sm">
                      Soumettre une entrée
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contributions.map(c => (
                      <div key={c.id} className="flex items-center justify-between p-4 rounded-xl bg-black/[0.02] border border-black/[0.05]">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-[#1A1A24] truncate">{c.nom}</div>
                          <div className="text-xs text-[#9090A8] mt-0.5">
                            {c.type} · {c.discipline} · {new Date(c.created_at).toLocaleDateString('fr')}
                          </div>
                        </div>
                        <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ml-3 ${
                          c.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          c.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {c.status === 'approved' ? <><CheckCircle className="w-3 h-3" /> Approuvé</> :
                           c.status === 'rejected' ? <><XCircle className="w-3 h-3" /> Rejeté</> :
                           <><Clock className="w-3 h-3" /> En attente</>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer lang="fr" />
    </>
  )
}
