'use client'
// src/app/profile/create/page.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
  User, Music, Tv2, BookOpen, Utensils, Palette, Theater, Users, ArrowRight, CheckCircle,
  Instagram, Facebook, Youtube, Globe, Phone, Mail, Image as ImageIcon
} from 'lucide-react'
import MediaInput from '@/components/MediaInput'

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
  { id: 'arts_spectacle',           label: 'Arts du spectacle',     emoji: '🎭' },
  { id: 'patrimoine_oral',          label: 'Patrimoine oral',       emoji: '📜' },
  { id: 'gastronomie_savoirs',      label: 'Gastronomie',           emoji: '🍽️' },
  { id: 'artisanat_arts_visuels',   label: 'Artisanat & Arts visuels', emoji: '🎨' },
  { id: 'spiritualites_rituels',    label: 'Spiritualités & Rituels', emoji: '🕯️' },
  { id: 'patrimoine_linguistique',  label: 'Patrimoine linguistique', emoji: '🗣️' },
  { id: 'jeux_sports',              label: 'Jeux & Sports',          emoji: '🎲' },
  { id: 'fetes_manifestations',     label: 'Fêtes & Manifestations', emoji: '🎉' },
  { id: 'patrimoine_bati',          label: 'Patrimoine bâti',        emoji: '🏛️' },
  { id: 'patrimoine_materiel',      label: 'Patrimoine matériel',    emoji: '🏺' },
  { id: 'musees_galeries',          label: 'Musées & Galeries',      emoji: '🖼️' },
  { id: 'bibliotheques_archives',   label: 'Bibliothèques & Archives', emoji: '📚' },
  { id: 'edition_presse',           label: 'Édition & Presse',       emoji: '📖' },
  { id: 'medias_diffusion',         label: 'Médias & Diffusion',     emoji: '📡' },
  { id: 'industries_creatives',     label: 'Industries créatives',   emoji: '🎬' },
  { id: 'formation_transmission',   label: 'Formation & Transmission', emoji: '🎓' },
  { id: 'infrastructures_culturelles', label: 'Infrastructures culturelles', emoji: '🏟️' },
]

const REGIONS = ['Caraïbes', 'Amérique du Nord', 'Amérique du Sud', 'Europe', 'Afrique', 'Asie', 'Océanie']

const inputClass = "filter-select w-full text-sm py-3"
const labelClass = "text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block"

export default function CreateProfilePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({
    nom: '', type: '', discipline: '', bio: '',
    ville: '', pays: '', region: '',
    image_url: '', cover_image_url: '',
    lien: '', lien_instagram: '', lien_facebook: '', lien_youtube: '',
    lien_tiktok: '', lien_twitter: '',
    lien_spotify: '', lien_deezer: '', lien_applemusic: '', lien_soundcloud: '',
    telephone: '', email_contact: '',
    tags: '',
  })

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

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
              Vous serez notifié une fois approuvé.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard" className="btn-primary">Mon espace</Link>
              <Link href="/" className="btn-secondary">Accueil</Link>
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
            <div className="text-xs font-semibold text-brand-rouge uppercase tracking-widest mb-2">Nouveau profil</div>
            <h1 className="font-display font-bold text-4xl text-[#1A1A24] mb-3">Créer un profil</h1>
            <p className="text-[#5A5A6E]">
              Un profil professionnel complet — photo, biographie, liens et plateformes de diffusion.
              Chaque profil est validé par notre équipe avant publication.
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-1">
            {['Type', 'Infos', 'Médias', 'Liens'].map((label, i) => (
              <div key={i} className="flex items-center gap-2 flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i+1 < step ? 'bg-emerald-500 text-white' : i+1 === step ? 'bg-brand-rouge text-white' : 'bg-black/[0.08] text-[#9090A8]'
                }`}>{i+1 < step ? '✓' : i+1}</div>
                <span className={`text-sm font-medium ${i+1 === step ? 'text-[#1A1A24]' : 'text-[#9090A8]'}`}>{label}</span>
                {i < 3 && <div className="w-8 h-px bg-black/[0.12] mx-1" />}
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
                    <button key={t.id} onClick={() => set('type', t.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        form.type === t.id ? 'border-brand-rouge bg-brand-rouge/[0.04]' : 'border-black/[0.08] hover:border-black/20'
                      }`}>
                      <t.icon className={`w-5 h-5 mb-2 ${form.type === t.id ? 'text-brand-rouge' : 'text-[#9090A8]'}`} />
                      <div className={`text-sm font-semibold ${form.type === t.id ? 'text-brand-rouge' : 'text-[#1A1A24]'}`}>{t.label}</div>
                    </button>
                  ))}
                </div>

                <h2 className="font-display font-bold text-lg text-[#1A1A24] mb-4">Catégorie principale</h2>
                <div className="flex flex-wrap gap-2 mb-8">
                  {DISCIPLINES.map(d => (
                    <button key={d.id} onClick={() => set('discipline', d.id)}
                      className={`tag text-sm ${form.discipline === d.id ? 'bg-brand-rouge text-white border-brand-rouge' : ''}`}>
                      {d.emoji} {d.label}
                    </button>
                  ))}
                </div>

                <button onClick={() => setStep(2)} disabled={!form.type}
                  className="btn-primary w-full justify-center py-3.5 disabled:opacity-40">
                  Continuer <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Étape 2 — Infos de base */}
            {step === 2 && (
              <form onSubmit={e => { e.preventDefault(); setStep(3) }} className="space-y-5">
                <h2 className="font-display font-bold text-xl text-[#1A1A24] mb-6">Informations</h2>

                <div>
                  <label className={labelClass}>Nom complet *</label>
                  <input value={form.nom} onChange={e => set('nom', e.target.value)} required
                    placeholder="Ex: Tabou Combo, Emeline Michel..." className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Biographie</label>
                  <textarea value={form.bio} onChange={e => set('bio', e.target.value)}
                    rows={5} placeholder="Décrivez le parcours, l'œuvre, l'histoire..."
                    className={inputClass + ' resize-none'} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Ville</label>
                    <input value={form.ville} onChange={e => set('ville', e.target.value)} placeholder="Port-au-Prince" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Pays</label>
                    <input value={form.pays} onChange={e => set('pays', e.target.value)} placeholder="Haïti" className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Région</label>
                  <select value={form.region} onChange={e => set('region', e.target.value)} className={inputClass}>
                    <option value="">Sélectionner...</option>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}><Phone className="w-3 h-3 inline mr-1" /> Téléphone (optionnel)</label>
                    <input value={form.telephone} onChange={e => set('telephone', e.target.value)} placeholder="+509 ..." className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}><Mail className="w-3 h-3 inline mr-1" /> Email de contact</label>
                    <input value={form.email_contact} onChange={e => set('email_contact', e.target.value)} placeholder="contact@..." className={inputClass} />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center py-3">← Retour</button>
                  <button type="submit" disabled={!form.nom} className="btn-primary flex-1 justify-center py-3 disabled:opacity-40">
                    Continuer <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Étape 3 — Médias */}
            {step === 3 && (
              <form onSubmit={e => { e.preventDefault(); setStep(4) }} className="space-y-5">
                <h2 className="font-display font-bold text-xl text-[#1A1A24] mb-2 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" /> Photos
                </h2>
                <p className="text-sm text-[#5A5A6E] mb-4">
                  Hébergez vos images sur un service comme Imgur, Cloudinary ou Google Drive (lien public), puis collez l'URL ici.
                </p>

                <MediaInput type="image" label="Photo de profil (carrée, recommandé 400x400px)"
                  value={form.image_url} onChange={url => set('image_url', url)} />

                <MediaInput type="image" label="Image de couverture (recommandé 1200x400px)"
                  value={form.cover_image_url} onChange={url => set('cover_image_url', url)} />

                <div>
                  <label className={labelClass}>Tags <span className="normal-case font-normal">(séparés par virgules)</span></label>
                  <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="compas, rasin, diaspora..." className={inputClass} />
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1 justify-center py-3">← Retour</button>
                  <button type="submit" className="btn-primary flex-1 justify-center py-3">
                    Continuer <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Étape 4 — Liens & plateformes */}
            {step === 4 && (
              <form onSubmit={submit} className="space-y-6">
                <h2 className="font-display font-bold text-xl text-[#1A1A24] mb-2">Liens & Plateformes</h2>
                <p className="text-sm text-[#5A5A6E] mb-4">Tous les champs sont optionnels.</p>

                <div>
                  <label className={labelClass}><Globe className="w-3 h-3 inline mr-1" /> Site web</label>
                  <input value={form.lien} onChange={e => set('lien', e.target.value)} placeholder="https://..." className={inputClass} />
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-[#1A1A24] mb-3">Réseaux sociaux</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}><Instagram className="w-3 h-3 inline mr-1" /> Instagram</label>
                      <input value={form.lien_instagram} onChange={e => set('lien_instagram', e.target.value)} placeholder="@username" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}><Facebook className="w-3 h-3 inline mr-1" /> Facebook</label>
                      <input value={form.lien_facebook} onChange={e => set('lien_facebook', e.target.value)} placeholder="URL page" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>TikTok</label>
                      <input value={form.lien_tiktok} onChange={e => set('lien_tiktok', e.target.value)} placeholder="@username" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>X (Twitter)</label>
                      <input value={form.lien_twitter} onChange={e => set('lien_twitter', e.target.value)} placeholder="@username" className={inputClass} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}><Youtube className="w-3 h-3 inline mr-1" /> YouTube</label>
                      <input value={form.lien_youtube} onChange={e => set('lien_youtube', e.target.value)} placeholder="URL chaîne" className={inputClass} />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-[#1A1A24] mb-3">Plateformes de musique / diffusion</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Spotify</label>
                      <input value={form.lien_spotify} onChange={e => set('lien_spotify', e.target.value)} placeholder="URL profil artiste" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Deezer</label>
                      <input value={form.lien_deezer} onChange={e => set('lien_deezer', e.target.value)} placeholder="URL profil artiste" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Apple Music</label>
                      <input value={form.lien_applemusic} onChange={e => set('lien_applemusic', e.target.value)} placeholder="URL profil artiste" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>SoundCloud</label>
                      <input value={form.lien_soundcloud} onChange={e => set('lien_soundcloud', e.target.value)} placeholder="URL profil" className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* Résumé */}
                <div className="bg-black/[0.03] rounded-2xl p-5 border border-black/[0.06]">
                  <h3 className="font-semibold text-sm text-[#1A1A24] mb-3">Résumé</h3>
                  <div className="space-y-1.5 text-sm text-[#5A5A6E]">
                    <div><span className="font-medium text-[#1A1A24]">Nom :</span> {form.nom}</div>
                    <div><span className="font-medium text-[#1A1A24]">Type :</span> {PROFILE_TYPES.find(t => t.id === form.type)?.label}</div>
                    {form.discipline && <div><span className="font-medium text-[#1A1A24]">Catégorie :</span> {DISCIPLINES.find(d => d.id === form.discipline)?.label}</div>}
                    {form.ville && <div><span className="font-medium text-[#1A1A24]">Lieu :</span> {form.ville}, {form.pays}</div>}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(3)} className="btn-secondary flex-1 justify-center py-3">← Retour</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3.5">
                    {loading
                      ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full" /> Envoi...</>
                      : <>Soumettre le profil ✓</>}
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
