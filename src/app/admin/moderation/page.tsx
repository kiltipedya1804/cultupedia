'use client'
// src/app/admin/moderation/page.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { CheckCircle, XCircle, Clock, User, BookOpen, AlertCircle } from 'lucide-react'

interface Contribution {
  id: string; nom: string; type: string; discipline: string
  description: string; ville: string; pays: string
  contributeur_nom: string | null; contributeur_email: string | null
  status: string; created_at: string
}

interface Profile {
  id: string; slug: string; nom: string; type: string
  bio: string | null; status: string; created_at: string
}

export default function ModerationPage() {
  const [tab, setTab] = useState<'contributions' | 'profiles'>('contributions')
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const role = d?.user?.role
        if (role === 'admin' || role === 'moderator') {
          setAuthorized(true)
          loadData()
        } else {
          setAuthorized(false)
        }
      })
      .catch(() => setAuthorized(false))
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [cRes, pRes] = await Promise.all([
        fetch('/api/admin/contributions'),
        fetch('/api/admin/profiles'),
      ])
      const cData = await cRes.json()
      const pData = await pRes.json()
      setContributions(cData.contributions ?? [])
      setProfiles(pData.profiles ?? [])
    } catch {}
    finally { setLoading(false) }
  }

  async function moderateContribution(id: string, action: 'approved' | 'rejected') {
    setProcessingId(id)
    try {
      await fetch(`/api/admin/contributions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      })
      setContributions(prev => prev.filter(c => c.id !== id))
    } catch {}
    finally { setProcessingId(null) }
  }

  async function moderateProfile(id: string, action: 'approved' | 'rejected') {
    setProcessingId(id)
    try {
      await fetch(`/api/admin/profiles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      })
      setProfiles(prev => prev.filter(p => p.id !== id))
    } catch {}
    finally { setProcessingId(null) }
  }

  if (authorized === null) {
    return (
      <>
        <Navbar lang="fr" />
        <main className="pt-24 pb-20"><div className="section max-w-4xl"><div className="skeleton h-96 rounded-2xl" /></div></main>
      </>
    )
  }

  if (authorized === false) {
    return (
      <>
        <Navbar lang="fr" />
        <main className="pt-24 pb-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h1 className="font-display font-bold text-2xl text-[#1A1A24] mb-2">Accès refusé</h1>
            <p className="text-[#9090A8] mb-6">Cette page est réservée aux administrateurs et modérateurs.</p>
            <Link href="/" className="btn-primary">Accueil</Link>
          </div>
        </main>
        <Footer lang="fr" />
      </>
    )
  }

  return (
    <>
      <Navbar lang="fr" />
      <main className="pt-24 pb-20">
        <div className="section max-w-5xl">

          <div className="mb-8 flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold text-brand-rouge uppercase tracking-widest mb-2">Modération</div>
              <h1 className="font-display font-bold text-3xl text-[#1A1A24]">Validation des contenus</h1>
            </div>
            <Link href="/admin/enrichissement" className="btn-primary flex items-center gap-2">
              ⚡ Enrichissement
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-8 bg-black/[0.04] p-1 rounded-xl w-fit">
            <button onClick={() => setTab('contributions')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition ${
                tab === 'contributions' ? 'bg-white text-[#1A1A24] shadow-sm' : 'text-[#9090A8]'
              }`}>
              <BookOpen className="w-4 h-4" /> Contributions ({contributions.length})
            </button>
            <button onClick={() => setTab('profiles')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition ${
                tab === 'profiles' ? 'bg-white text-[#1A1A24] shadow-sm' : 'text-[#9090A8]'
              }`}>
              <User className="w-4 h-4" /> Profils ({profiles.length})
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
            </div>
          ) : tab === 'contributions' ? (
            contributions.length === 0 ? (
              <div className="text-center py-20">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="font-display font-bold text-xl text-[#1A1A24]">Tout est validé !</h3>
                <p className="text-[#9090A8]">Aucune contribution en attente.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {contributions.map(c => (
                  <div key={c.id} className="card p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-brand-rouge bg-brand-rouge/10 px-2 py-0.5 rounded-full">{c.type}</span>
                          <span className="text-xs text-[#9090A8]">{c.discipline}</span>
                        </div>
                        <h3 className="font-display font-bold text-lg text-[#1A1A24]">{c.nom}</h3>
                        {(c.ville || c.pays) && <p className="text-xs text-[#9090A8] mt-0.5">{c.ville}, {c.pays}</p>}
                      </div>
                      <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full flex-shrink-0">
                        <Clock className="w-3 h-3" /> En attente
                      </span>
                    </div>
                    <p className="text-sm text-[#5A5A6E] leading-relaxed mb-4 line-clamp-3">{c.description}</p>
                    {c.contributeur_nom && (
                      <p className="text-xs text-[#9090A8] mb-4">
                        Soumis par <strong>{c.contributeur_nom}</strong>
                        {c.contributeur_email && ` (${c.contributeur_email})`}
                      </p>
                    )}
                    <div className="flex gap-3">
                      <button onClick={() => moderateContribution(c.id, 'approved')}
                        disabled={processingId === c.id}
                        className="btn-primary text-sm flex-1 justify-center py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50">
                        <CheckCircle className="w-4 h-4" /> Approuver
                      </button>
                      <button onClick={() => moderateContribution(c.id, 'rejected')}
                        disabled={processingId === c.id}
                        className="btn-secondary text-sm flex-1 justify-center py-2.5 text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50">
                        <XCircle className="w-4 h-4" /> Rejeter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            profiles.length === 0 ? (
              <div className="text-center py-20">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="font-display font-bold text-xl text-[#1A1A24]">Tout est validé !</h3>
                <p className="text-[#9090A8]">Aucun profil en attente.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {profiles.map(p => (
                  <div key={p.id} className="card p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <span className="text-xs font-semibold text-brand-rouge bg-brand-rouge/10 px-2 py-0.5 rounded-full">{p.type}</span>
                        <h3 className="font-display font-bold text-lg text-[#1A1A24] mt-1">{p.nom}</h3>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full flex-shrink-0">
                        <Clock className="w-3 h-3" /> En attente
                      </span>
                    </div>
                    {p.bio && <p className="text-sm text-[#5A5A6E] leading-relaxed mb-4 line-clamp-2">{p.bio}</p>}
                    <div className="flex gap-3">
                      <button onClick={() => moderateProfile(p.id, 'approved')}
                        disabled={processingId === p.id}
                        className="btn-primary text-sm flex-1 justify-center py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50">
                        <CheckCircle className="w-4 h-4" /> Approuver
                      </button>
                      <button onClick={() => moderateProfile(p.id, 'rejected')}
                        disabled={processingId === p.id}
                        className="btn-secondary text-sm flex-1 justify-center py-2.5 text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50">
                        <XCircle className="w-4 h-4" /> Rejeter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </main>
      <Footer lang="fr" />
    </>
  )
}
