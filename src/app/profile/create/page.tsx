'use client'
// src/app/profile/create/page.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { User, Music, Tv2, BookOpen, Utensils, Palette, Theater, Users, ArrowRight, CheckCircle } from 'lucide-react'

const PROFILE_TYPES = [
  { id: 'artiste',             label: 'Artiste',                    icon: Palette  },
  { id: 'musicien',            label: 'Musicien / Chanteur',        icon: Music    },
  { id: 'danseur',             label: 'Danseur / Chorégraphe',      icon: Users    },
  { id: 'acteur',              label: 'Acteur / Comédien',          icon: Theater  },
  { id: 'realisateur',         label: 'Réalisateur / Cinéaste',     icon: Tv2      },
  { id: 'ecrivain',            label: 'Écrivain / Auteur',          icon: BookOpen },
  { id: 'responsable_culturel',label: 'Responsable culturel',       icon: User     },
  { id: 'collaborateur',       label: 'Collaborateur / Producteur', icon: Users    },
  { id: 'autre',               label: 'Autre',                      icon: User     },
]

const DISCIPLINES = [
  { id: 'musique',      label: 'Musique',      emoji: '🎵' },
  { id: 'danse',        label: 'Danse',        emoji: '💃' },
  { id: 'cinema',       label: 'Cinéma',       emoji: '🎬' },
  { id: 'graffiti',     label: 'Arts Visuels', emoji: '🎨' },
  { id: 'theatre',      label: 'Théâtre',      emoji: '🎭' },
  { id: 'gastronomie',  label: 'Gastronomie',  emoji: '🍽️' },
  { id: 'edition',      label: 'Édition',      emoji: '📚' },
]

const REGIONS = ['Caraïbes', 'Amérique du Nord', 'Amérique du Sud', 'Europe', 'Afrique', 'Asie', 'Océanie']

export default function CreateProfilePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({
    nom: '', type: '', discipline: '', bio: '',
    ville: '', pays: '', region: '',
    lien: '', lien_instagram: '', lien_facebook: '', lien_youtube: '',
    tags: '', image_url: '',
  })

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Erreur lors de la création')
      setDone(true)
    } catch (err) {
      alert('Erreur : ' + (err instanceof Error ? err.message : 'inconnue'))
    } finally {
      setLoading(false)
    }
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
            <h1 className="font-display font-bold text-3xl text-[#1A1A24] mb-3">Profil soumis !</h1>
            <p className="text-[#5A5A6E] mb-8">
              Votre profil est en attente de validation par notre équipe. 
              Vous serez notifié par email une fois approuvé.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/" className="btn-primary">← Accueil</Link>
              <button onClick={() => { setDone(false); setStep(1); setForm({ nom:'',type:'',discipline:'',bio:'',ville:'',pays:'',region:'',lien:'',lien_instagram:'',lien_facebook:'',lien_youtube:'',tags:'',image_url:'' }) }}
                      className="btn-secondary">Créer un autre profil</button>
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

          {/* Header */}
          <div className="mb-10">
            <div className="text-xs font-semibold text-brand-rouge uppercase tracking-widest mb-2">Nouveau profil</div>
            <h1 className="font-display font-bold text-4xl text-[#1A1A24] mb-3">Créer un profil</h1>
            <p className="text-[#5A5A6E]">
              Ajoutez un artiste, un collaborateur ou une personnalité culturelle haïtienne.
              Chaque profil est validé par notre équipe avant publication.
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-10">
            {[1,2,3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  s < step ? 'bg-emerald-500 text-white' :
                  s === step ? 'bg-brand-rouge text-white' :
                  'bg-black/[0.08] text-[#9090A8]'
                }`}>{s < step ? '✓' : s}</div>
                <span className={`text-sm font-medium ${s === step ? 'text-[#1A1A24]' : 'text-[#9090A8]'}`}>
                  {s === 1 ? 'Type' : s === 2 ? 'Informations' : 'Liens & Tags'}
                </span>
                {s < 3 && <div className="w-8 h-px bg-black/[0.12] mx-1" />}
              </div>
            ))}
          </div>

          <div className="card p-8">

            {/* Étape 1 — Type */}
            {step === 1 && (
              <div>
                <h2 className="font-display font-bold text-xl text-[#1A1A24] mb-6">Quel type de profil ?</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                  {PROFILE_TYPES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => set('type', t.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        form.type === t.id
                          ? 'border-brand-rouge bg-brand-rouge/[0.04]'
                          : 'border-black/[0.08] hover:border-black/20'
                      }`}
                    >
                      <t.icon className={`w-5 h-5 mb-2 ${form.type === t.id ? 'text-brand-rouge' : 'text-[#9090A8]'}`} />
                      <div className={`text-sm font-semibold ${form.type === t.id ? 'text-brand-rouge' : 'text-[#1A1A24]'}`}>
                        {t.label}
                      </div>
                    </button>
                  ))}
                </div>

                <h2 className="font-display font-bold text-xl text-[#1A1A24] mb-4">Discipline principale</h2>
                <div className="flex flex-wrap gap-2 mb-8">
                  {DISCIPLINES.map(d => (
                    <button
                      key={d.id}
                      onClick={() => set('discipline', d.id)}
                      className={`tag text-sm ${form.discipline === d.id ? 'active bg-brand-rouge text-white border-brand-rouge' : ''}`}
                    >
                      {d.emoji} {d.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!form.type}
                  className="btn-primary w-full justify-center py-3.5 disabled:opacity-40"
                >
                  Continuer <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Étape 2 — Informations */}
            {step === 2 && (
              <form onSubmit={(e) => { e.preventDefault(); setStep(3) }} className="space-y-5">
                <h2 className="font-display font-bold text-xl text-[#1A1A24] mb-6">Informations du profil</h2>

                <div>
                  <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">
                    Nom complet *
                  </label>
                  <input
                    value={form.nom} onChange={e => set('nom', e.target.value)}
                    required placeholder="Ex: Tabou Combo, Emeline Michel..."
                    className="filter-select w-full text-sm py-3"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">
                    Biographie
                  </label>
                  <textarea
                    value={form.bio} onChange={e => set('bio', e.target.value)}
                    rows={5} placeholder="Décrivez cette personne ou organisation..."
                    className="filter-select w-full text-sm resize-none py-3"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">Ville</label>
                    <input value={form.ville} onChange={e => set('ville', e.target.value)}
                           placeholder="Port-au-Prince" className="filter-select w-full text-sm py-3" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">Pays</label>
                    <input value={form.pays} onChange={e => set('pays', e.target.value)}
                           placeholder="Haïti" className="filter-select w-full text-sm py-3" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">Région</label>
                  <select value={form.region} onChange={e => set('region', e.target.value)}
                          className="filter-select w-full text-sm py-3">
                    <option value="">Sélectionner...</option>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">URL Photo</label>
                  <input value={form.image_url} onChange={e => set('image_url', e.target.value)}
                         placeholder="https://..." className="filter-select w-full text-sm py-3" />
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center py-3">
                    ← Retour
                  </button>
                  <button type="submit" disabled={!form.nom} className="btn-primary flex-1 justify-center py-3 disabled:opacity-40">
                    Continuer <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Étape 3 — Liens & Tags */}
            {step === 3 && (
              <form onSubmit={submit} className="space-y-5">
                <h2 className="font-display font-bold text-xl text-[#1A1A24] mb-6">Liens & Tags</h2>

                <div>
                  <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">Site web</label>
                  <input value={form.lien} onChange={e => set('lien', e.target.value)}
                         placeholder="https://..." className="filter-select w-full text-sm py-3" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">Instagram</label>
                    <input value={form.lien_instagram} onChange={e => set('lien_instagram', e.target.value)}
                           placeholder="@username" className="filter-select w-full text-sm py-3" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">Facebook</label>
                    <input value={form.lien_facebook} onChange={e => set('lien_facebook', e.target.value)}
                           placeholder="URL page" className="filter-select w-full text-sm py-3" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">YouTube</label>
                    <input value={form.lien_youtube} onChange={e => set('lien_youtube', e.target.value)}
                           placeholder="URL chaîne" className="filter-select w-full text-sm py-3" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">
                    Tags <span className="text-[#9090A8] normal-case font-normal">(séparés par des virgules)</span>
                  </label>
                  <input value={form.tags} onChange={e => set('tags', e.target.value)}
                         placeholder="compas, rasin, diaspora..." className="filter-select w-full text-sm py-3" />
                </div>

                {/* Résumé */}
                <div className="bg-black/[0.03] rounded-2xl p-5 border border-black/[0.06]">
                  <h3 className="font-semibold text-sm text-[#1A1A24] mb-3">Résumé</h3>
                  <div className="space-y-1.5 text-sm text-[#5A5A6E]">
                    <div><span className="font-medium text-[#1A1A24]">Nom :</span> {form.nom}</div>
                    <div><span className="font-medium text-[#1A1A24]">Type :</span> {PROFILE_TYPES.find(t => t.id === form.type)?.label}</div>
                    {form.discipline && <div><span className="font-medium text-[#1A1A24]">Discipline :</span> {DISCIPLINES.find(d => d.id === form.discipline)?.label}</div>}
                    {form.ville && <div><span className="font-medium text-[#1A1A24]">Ville :</span> {form.ville}, {form.pays}</div>}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1 justify-center py-3">
                    ← Retour
                  </button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3.5">
                    {loading
                      ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full" /> Envoi...</>
                      : <>Soumettre le profil ✓</>
                    }
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer lang="fr" />
    </>
  )
}
