'use client'
// src/app/community/new/page.tsx
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Send, ArrowLeft } from 'lucide-react'

const CATEGORIES = [
  { id: 'general', nom: 'Discussion générale', emoji: '💬' },
  { id: 'musique_danse', nom: 'Musique & Danse', emoji: '🎵' },
  { id: 'cinema_theatre', nom: 'Cinéma & Théâtre', emoji: '🎬' },
  { id: 'art_artisanat', nom: 'Arts & Artisanat', emoji: '🎨' },
  { id: 'gastronomie', nom: 'Gastronomie', emoji: '🍽️' },
  { id: 'histoire_patrimoine', nom: 'Histoire & Patrimoine', emoji: '🏛️' },
  { id: 'contributions', nom: 'Aide aux contributions', emoji: '✍️' },
  { id: 'diaspora', nom: 'Diaspora', emoji: '🌍' },
]

const inputClass = "filter-select w-full text-sm py-3"
const labelClass = "text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block"

export default function NewTopicPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({
    titre: '',
    contenu: '',
    category_id: searchParams.get('category') ?? 'general',
  })

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.user) setUser(d.user); else router.push('/auth') })
      .finally(() => setLoading(false))
  }, [router])

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    try {
      const res = await fetch('/api/community/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      router.push(`/community/topic/${data.topic.id}`)
    } catch { alert('Erreur lors de la création') }
    finally { setSending(false) }
  }

  if (loading) return <><Navbar lang="fr" /><main className="pt-24"><div className="section max-w-2xl"><div className="skeleton h-96 rounded-2xl" /></div></main></>

  return (
    <>
      <Navbar lang="fr" />
      <main className="pt-24 pb-20">
        <div className="section max-w-2xl">

          <Link href="/community" className="btn-ghost text-sm mb-6 inline-flex">
            <ArrowLeft className="w-4 h-4" /> Retour au forum
          </Link>

          <div className="mb-8">
            <div className="text-xs font-semibold text-brand-rouge uppercase tracking-widest mb-2">Forum</div>
            <h1 className="font-display font-bold text-3xl text-[#1A1A24]">Nouveau sujet</h1>
          </div>

          <form onSubmit={submit} className="card p-8 space-y-5">
            <div>
              <label className={labelClass}>Catégorie *</label>
              <select value={form.category_id} onChange={e => set('category_id', e.target.value)} className={inputClass}>
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Titre du sujet *</label>
              <input value={form.titre} onChange={e => set('titre', e.target.value)}
                placeholder="Ex: Quel est votre artiste haïtien préféré ?" required
                maxLength={200} className={inputClass} />
              <p className="text-xs text-[#9090A8] mt-1">{form.titre.length}/200</p>
            </div>

            <div>
              <label className={labelClass}>Contenu *</label>
              <textarea value={form.contenu} onChange={e => set('contenu', e.target.value)}
                rows={10} required placeholder="Développez votre sujet ici..."
                className={inputClass + ' resize-none'} />
            </div>

            <div className="flex gap-3 pt-2">
              <Link href="/community" className="btn-secondary flex-1 justify-center py-3">Annuler</Link>
              <button type="submit" disabled={sending || !form.titre || !form.contenu}
                className="btn-primary flex-1 justify-center py-3 disabled:opacity-40">
                {sending
                  ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full" /> Création...</>
                  : <><Send className="w-4 h-4" /> Publier le sujet</>}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer lang="fr" />
    </>
  )
}
