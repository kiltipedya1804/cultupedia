'use client'
// src/app/profile/[slug]/edit/page.tsx
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
  ArrowRight, CheckCircle, Instagram, Facebook, Youtube, Globe, Phone, Mail, Image as ImageIcon
} from 'lucide-react'
import MediaInput from '@/components/MediaInput'

const REGIONS = ['Caraïbes', 'Amérique du Nord', 'Amérique du Sud', 'Europe', 'Afrique', 'Asie', 'Océanie']
const inputClass = "filter-select w-full text-sm py-3"
const labelClass = "text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block"

interface FormState {
  nom: string; bio: string; ville: string; pays: string; region: string
  image_url: string; cover_image_url: string
  lien: string; lien_instagram: string; lien_facebook: string; lien_youtube: string
  lien_tiktok: string; lien_twitter: string
  lien_spotify: string; lien_deezer: string; lien_applemusic: string; lien_soundcloud: string
  telephone: string; email_contact: string; tags: string
}

const EMPTY: FormState = {
  nom: '', bio: '', ville: '', pays: '', region: '',
  image_url: '', cover_image_url: '',
  lien: '', lien_instagram: '', lien_facebook: '', lien_youtube: '',
  lien_tiktok: '', lien_twitter: '',
  lien_spotify: '', lien_deezer: '', lien_applemusic: '', lien_soundcloud: '',
  telephone: '', email_contact: '', tags: '',
}

export default function EditProfilePage() {
  const router = useRouter()
  const params = useParams<{ slug: string }>()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/profiles/${params.slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Profil introuvable ou accès refusé')
        return res.json()
      })
      .then(data => {
        const p = data.data
        setForm({
          nom: p.nom ?? '', bio: p.bio ?? '', ville: p.ville ?? '', pays: p.pays ?? '', region: p.region ?? '',
          image_url: p.image_url ?? '', cover_image_url: p.cover_image_url ?? '',
          lien: p.lien ?? '', lien_instagram: p.lien_instagram ?? '', lien_facebook: p.lien_facebook ?? '', lien_youtube: p.lien_youtube ?? '',
          lien_tiktok: p.lien_tiktok ?? '', lien_twitter: p.lien_twitter ?? '',
          lien_spotify: p.lien_spotify ?? '', lien_deezer: p.lien_deezer ?? '', lien_applemusic: p.lien_applemusic ?? '', lien_soundcloud: p.lien_soundcloud ?? '',
          telephone: p.telephone ?? '', email_contact: p.email_contact ?? '', tags: p.tags ?? '',
        })
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [params.slug])

  function set(k: keyof FormState, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/profiles/${params.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Erreur')
      }
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar lang="fr" />
        <main className="pt-24 pb-20"><div className="section max-w-3xl"><div className="skeleton h-96 rounded-2xl" /></div></main>
      </>
    )
  }

  if (error && !form.nom) {
    return (
      <>
        <Navbar lang="fr" />
        <main className="pt-24 pb-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display font-bold text-2xl text-[#1A1A24] mb-2">{error}</h1>
            <Link href="/dashboard" className="btn-primary mt-4 inline-flex">Mon espace</Link>
          </div>
        </main>
        <Footer lang="fr" />
      </>
    )
  }

  if (done) {
    return (
      <>
        <Navbar lang="fr" />
        <main className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-lg">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h1 className="font-display font-bold text-3xl text-[#1A1A24] mb-3">Modifications enregistrées</h1>
            <p className="text-[#5A5A6E] mb-8">
              Votre profil repasse en attente de validation avant d'être republié.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard" className="btn-primary">Mon espace</Link>
              <Link href={`/profile/${params.slug}`} className="btn-secondary">Voir le profil</Link>
            </div>
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
        <div className="section max-w-3xl">
          <div className="mb-10">
            <div className="text-xs font-semibold text-brand-rouge uppercase tracking-widest mb-2">Édition</div>
            <h1 className="font-display font-bold text-4xl text-[#1A1A24] mb-3">Modifier le profil</h1>
            <p className="text-[#5A5A6E]">Toute modification repasse le profil en validation.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 mb-6">{error}</div>
          )}

          <form onSubmit={submit} className="card p-8 space-y-6">

            <div>
              <label className={labelClass}>Nom complet *</label>
              <input value={form.nom} onChange={e => set('nom', e.target.value)} required className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Biographie</label>
              <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={5} className={inputClass + ' resize-none'} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div><label className={labelClass}>Ville</label><input value={form.ville} onChange={e => set('ville', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Pays</label><input value={form.pays} onChange={e => set('pays', e.target.value)} className={inputClass} /></div>
            </div>

            <div>
              <label className={labelClass}>Région</label>
              <select value={form.region} onChange={e => set('region', e.target.value)} className={inputClass}>
                <option value="">Sélectionner...</option>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div><label className={labelClass}><Phone className="w-3 h-3 inline mr-1" /> Téléphone</label><input value={form.telephone} onChange={e => set('telephone', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}><Mail className="w-3 h-3 inline mr-1" /> Email contact</label><input value={form.email_contact} onChange={e => set('email_contact', e.target.value)} className={inputClass} /></div>
            </div>

            <hr className="border-black/[0.06]" />

            <h3 className="font-display font-bold text-lg text-[#1A1A24] flex items-center gap-2"><ImageIcon className="w-5 h-5" /> Photos</h3>

            <MediaInput type="image" label="Photo de profil" value={form.image_url} onChange={url => set('image_url', url)} />

            <MediaInput type="image" label="Image de couverture" value={form.cover_image_url} onChange={url => set('cover_image_url', url)} />

            <div>
              <label className={labelClass}>Tags</label>
              <input value={form.tags} onChange={e => set('tags', e.target.value)} className={inputClass} />
            </div>

            <hr className="border-black/[0.06]" />

            <h3 className="font-display font-bold text-lg text-[#1A1A24]">Liens & Plateformes</h3>

            <div>
              <label className={labelClass}><Globe className="w-3 h-3 inline mr-1" /> Site web</label>
              <input value={form.lien} onChange={e => set('lien', e.target.value)} className={inputClass} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={labelClass}><Instagram className="w-3 h-3 inline mr-1" /> Instagram</label><input value={form.lien_instagram} onChange={e => set('lien_instagram', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}><Facebook className="w-3 h-3 inline mr-1" /> Facebook</label><input value={form.lien_facebook} onChange={e => set('lien_facebook', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>TikTok</label><input value={form.lien_tiktok} onChange={e => set('lien_tiktok', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>X (Twitter)</label><input value={form.lien_twitter} onChange={e => set('lien_twitter', e.target.value)} className={inputClass} /></div>
              <div className="sm:col-span-2"><label className={labelClass}><Youtube className="w-3 h-3 inline mr-1" /> YouTube</label><input value={form.lien_youtube} onChange={e => set('lien_youtube', e.target.value)} className={inputClass} /></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={labelClass}>Spotify</label><input value={form.lien_spotify} onChange={e => set('lien_spotify', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Deezer</label><input value={form.lien_deezer} onChange={e => set('lien_deezer', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Apple Music</label><input value={form.lien_applemusic} onChange={e => set('lien_applemusic', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>SoundCloud</label><input value={form.lien_soundcloud} onChange={e => set('lien_soundcloud', e.target.value)} className={inputClass} /></div>
            </div>

            <div className="flex gap-3 pt-2">
              <Link href={`/profile/${params.slug}`} className="btn-secondary flex-1 justify-center py-3">Annuler</Link>
              <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center py-3.5">
                {saving
                  ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full" /> Enregistrement...</>
                  : <>Enregistrer <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer lang="fr" />
    </>
  )
}
