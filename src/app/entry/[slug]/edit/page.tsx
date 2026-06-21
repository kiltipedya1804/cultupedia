'use client'
// src/app/entry/[slug]/edit/page.tsx
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
  Save, ArrowLeft, Plus, Trash2, MapPin, Image as ImageIcon,
  Video, Music, Clock, BookOpen, Globe, CheckCircle, AlertCircle
} from 'lucide-react'
import MediaInput from '@/components/MediaInput'

const inputClass = "filter-select w-full text-sm py-3"
const labelClass = "text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block"

const STATUTS = ['en_cours', 'archive', 'en_projet', 'fermé']
const REGIONS = ['Caraïbes', 'Amérique du Nord', 'Amérique du Sud', 'Europe', 'Afrique', 'Asie', 'Océanie']

interface TimelineEvent { date: string; titre: string; description: string }
interface MediaItem { url: string; caption: string; credit: string }
interface Source { titre: string; url: string; type: string }

interface EntryForm {
  nom: string; nom_ht: string; nom_en: string
  description: string; description_ht: string; description_en: string
  type: string; sous_discipline: string; annee: string; statut: string
  ville: string; pays: string; region: string
  responsable: string; institution: string; studio: string
  image_url: string; lien: string; tag: string; rubrique: string
  latitude: string; longitude: string
  featured: boolean; verified: boolean
  images: MediaItem[]; videos: MediaItem[]; audios: MediaItem[]
  timeline: TimelineEvent[]; sources: Source[]
}

const EMPTY: EntryForm = {
  nom: '', nom_ht: '', nom_en: '',
  description: '', description_ht: '', description_en: '',
  type: '', sous_discipline: '', annee: '', statut: 'en_cours',
  ville: '', pays: '', region: '',
  responsable: '', institution: '', studio: '',
  image_url: '', lien: '', tag: '', rubrique: '',
  latitude: '', longitude: '',
  featured: false, verified: false,
  images: [], videos: [], audios: [],
  timeline: [], sources: [],
}

export default function EditEntryPage() {
  const router = useRouter()
  const params = useParams<{ slug: string }>()
  const [form, setForm] = useState<EntryForm>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'base' | 'medias' | 'geo' | 'timeline' | 'sources' | 'traductions'>('base')
  const [completude, setCompletude] = useState(0)

  useEffect(() => {
    fetch(`/api/entries/${params.slug}`)
      .then(r => r.json())
      .then(d => {
        const e = d.data
        if (!e) { setError('Entrée introuvable'); setLoading(false); return }
        setForm({
          nom: e.nom ?? '', nom_ht: e.nom_ht ?? '', nom_en: e.nom_en ?? '',
          description: e.description ?? '', description_ht: e.description_ht ?? '', description_en: e.description_en ?? '',
          type: e.type ?? '', sous_discipline: e.sous_discipline ?? '', annee: e.annee ?? '', statut: e.statut ?? 'en_cours',
          ville: e.ville ?? '', pays: e.pays ?? '', region: e.region ?? '',
          responsable: e.responsable ?? '', institution: e.institution ?? '', studio: e.studio ?? '',
          image_url: e.image_url ?? '', lien: e.lien ?? '', tag: e.tag ?? '', rubrique: e.rubrique ?? '',
          latitude: e.latitude?.toString() ?? '', longitude: e.longitude?.toString() ?? '',
          featured: e.featured ?? false, verified: e.verified ?? false,
          images: e.images ?? [], videos: e.videos ?? [], audios: e.audios ?? [],
          timeline: e.timeline ?? [], sources: e.sources ?? [],
        })
        setCompletude(e.completude ?? 0)
      })
      .catch(() => setError('Erreur de chargement'))
      .finally(() => setLoading(false))
  }, [params.slug])

  function set(k: keyof EntryForm, v: any) { setForm(f => ({ ...f, [k]: v })) }

  // Media helpers
  function addMedia(type: 'images' | 'videos' | 'audios') {
    set(type, [...form[type], { url: '', caption: '', credit: '' }])
  }
  function updateMedia(type: 'images' | 'videos' | 'audios', i: number, k: keyof MediaItem, v: string) {
    const arr = [...form[type]]; arr[i] = { ...arr[i], [k]: v }; set(type, arr)
  }
  function removeMedia(type: 'images' | 'videos' | 'audios', i: number) {
    set(type, form[type].filter((_, idx) => idx !== i))
  }

  // Timeline helpers
  function addEvent() { set('timeline', [...form.timeline, { date: '', titre: '', description: '' }]) }
  function updateEvent(i: number, k: keyof TimelineEvent, v: string) {
    const arr = [...form.timeline]; arr[i] = { ...arr[i], [k]: v }; set('timeline', arr)
  }
  function removeEvent(i: number) { set('timeline', form.timeline.filter((_, idx) => idx !== i)) }

  // Source helpers
  function addSource() { set('sources', [...form.sources, { titre: '', url: '', type: 'web' }]) }
  function updateSource(i: number, k: keyof Source, v: string) {
    const arr = [...form.sources]; arr[i] = { ...arr[i], [k]: v }; set('sources', arr)
  }
  function removeSource(i: number) { set('sources', form.sources.filter((_, idx) => idx !== i)) }

  async function save() {
    setSaving(true); setError('')
    try {
      const res = await fetch(`/api/entries/${params.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          latitude: form.latitude ? parseFloat(form.latitude) : null,
          longitude: form.longitude ? parseFloat(form.longitude) : null,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Erreur')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  const TABS = [
    { id: 'base',        label: 'Informations',  icon: BookOpen },
    { id: 'medias',      label: 'Médias',         icon: ImageIcon },
    { id: 'geo',         label: 'Géolocalisation',icon: MapPin },
    { id: 'timeline',    label: 'Timeline',        icon: Clock },
    { id: 'sources',     label: 'Sources',         icon: Globe },
    { id: 'traductions', label: 'Traductions',     icon: Globe },
  ] as const

  if (loading) return (
    <>
      <Navbar lang="fr" />
      <main className="pt-24 pb-20"><div className="section max-w-5xl"><div className="skeleton h-96 rounded-2xl" /></div></main>
    </>
  )

  return (
    <>
      <Navbar lang="fr" />
      <main className="pt-20 pb-20">
        <div className="section max-w-5xl">

          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <Link href={`/entry/${params.slug}`} className="btn-ghost text-sm mb-3 inline-flex">
                <ArrowLeft className="w-4 h-4" /> Retour à la fiche
              </Link>
              <h1 className="font-display font-bold text-3xl text-[#1A1A24]">{form.nom || 'Édition'}</h1>
              <p className="text-[#9090A8] text-sm mt-1">/entry/{params.slug}</p>
            </div>

            {/* Score complétude */}
            <div className="text-center">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#f0f0f0" strokeWidth="8"/>
                  <circle cx="40" cy="40" r="32" fill="none"
                    stroke={completude >= 70 ? '#10b981' : completude >= 40 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${(completude / 100) * 201} 201`}/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-bold text-lg text-[#1A1A24]">{completude}%</span>
                </div>
              </div>
              <p className="text-xs text-[#9090A8] mt-1">Complétude</p>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 mb-6 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
          {saved && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl p-4 mb-6 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" /> Modifications enregistrées !
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 mb-8 overflow-x-auto pb-1">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                  tab === t.id ? 'bg-brand-rouge text-white' : 'bg-black/[0.04] text-[#5A5A6E] hover:bg-black/[0.08]'
                }`}>
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>

          <div className="card p-8">

            {/* ── Tab: Informations de base ── */}
            {tab === 'base' && (
              <div className="space-y-5">
                <h2 className="font-display font-bold text-xl text-[#1A1A24] mb-6">Informations générales</h2>

                <div>
                  <label className={labelClass}>Nom *</label>
                  <input value={form.nom} onChange={e => set('nom', e.target.value)} className={inputClass} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Type</label>
                    <input value={form.type} onChange={e => set('type', e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Sous-discipline</label>
                    <input value={form.sous_discipline} onChange={e => set('sous_discipline', e.target.value)} className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Année</label>
                    <input value={form.annee} onChange={e => set('annee', e.target.value)} placeholder="ex: 1968" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Statut</label>
                    <select value={form.statut} onChange={e => set('statut', e.target.value)} className={inputClass}>
                      {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Description *</label>
                  <textarea value={form.description} onChange={e => set('description', e.target.value)}
                    rows={8} className={inputClass + ' resize-none'} />
                  <p className="text-xs text-[#9090A8] mt-1">{form.description.length} caractères</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className={labelClass}>Ville</label>
                    <input value={form.ville} onChange={e => set('ville', e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Pays</label>
                    <input value={form.pays} onChange={e => set('pays', e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Région</label>
                    <select value={form.region} onChange={e => set('region', e.target.value)} className={inputClass}>
                      <option value="">Sélectionner...</option>
                      {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Responsable</label>
                    <input value={form.responsable} onChange={e => set('responsable', e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Institution</label>
                    <input value={form.institution} onChange={e => set('institution', e.target.value)} className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Lien web</label>
                    <input value={form.lien} onChange={e => set('lien', e.target.value)} placeholder="https://..." className={inputClass} />
                  </div>
                  <MediaInput type="image" label="Image principale" value={form.image_url}
                    onChange={url => set('image_url', url)} />
                </div>

                <div>
                  <label className={labelClass}>Tags <span className="normal-case font-normal">(virgules)</span></label>
                  <input value={form.tag} onChange={e => set('tag', e.target.value)} className={inputClass} />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="w-4 h-4 accent-brand-rouge" />
                    <span className="text-sm font-medium text-[#1A1A24]">⭐ Mise en avant</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.verified} onChange={e => set('verified', e.target.checked)} className="w-4 h-4 accent-emerald-500" />
                    <span className="text-sm font-medium text-[#1A1A24]">✅ Entrée vérifiée</span>
                  </label>
                </div>
              </div>
            )}

            {/* ── Tab: Médias ── */}
            {tab === 'medias' && (
              <div className="space-y-8">
                <h2 className="font-display font-bold text-xl text-[#1A1A24]">Médias</h2>
                <p className="text-sm text-[#5A5A6E]">
                  Ajoutez des images, vidéos et fichiers audio pour enrichir la fiche.
                  Hébergez vos fichiers sur Cloudinary, YouTube, SoundCloud, etc.
                </p>

                {/* Images */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#1A1A24] flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Photos ({form.images.length})</h3>
                    <button onClick={() => addMedia('images')} className="btn-ghost text-sm"><Plus className="w-4 h-4" /> Ajouter</button>
                  </div>
                  {form.images.length === 0 && <p className="text-sm text-[#9090A8] italic">Aucune photo ajoutée</p>}
                  {form.images.map((img, i) => (
                    <div key={i} className="border border-black/[0.08] rounded-2xl p-4 mb-3 space-y-3">
                      <MediaInput type="image" label="Photo" value={img.url}
                        onChange={url => updateMedia('images', i, 'url', url)} />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Légende</label>
                          <input value={img.caption} onChange={e => updateMedia('images', i, 'caption', e.target.value)} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Crédit photo</label>
                          <input value={img.credit} onChange={e => updateMedia('images', i, 'credit', e.target.value)} className={inputClass} />
                        </div>
                      </div>
                      <button onClick={() => removeMedia('images', i)} className="text-red-500 text-xs flex items-center gap-1 hover:text-red-700">
                        <Trash2 className="w-3 h-3" /> Supprimer
                      </button>
                    </div>
                  ))}
                </div>

                {/* Vidéos */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#1A1A24] flex items-center gap-2"><Video className="w-4 h-4" /> Vidéos ({form.videos.length})</h3>
                    <button onClick={() => addMedia('videos')} className="btn-ghost text-sm"><Plus className="w-4 h-4" /> Ajouter</button>
                  </div>
                  {form.videos.length === 0 && <p className="text-sm text-[#9090A8] italic">Aucune vidéo ajoutée</p>}
                  {form.videos.map((v, i) => (
                    <div key={i} className="border border-black/[0.08] rounded-2xl p-4 mb-3 space-y-3">
                      <MediaInput type="video" label="Vidéo (YouTube/Vimeo en lien, ou fichier)" value={v.url}
                        onChange={url => updateMedia('videos', i, 'url', url)}
                        placeholder="https://youtube.com/watch?v=..." />
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={labelClass}>Titre</label><input value={v.caption} onChange={e => updateMedia('videos', i, 'caption', e.target.value)} className={inputClass} /></div>
                        <div><label className={labelClass}>Source</label><input value={v.credit} onChange={e => updateMedia('videos', i, 'credit', e.target.value)} className={inputClass} /></div>
                      </div>
                      <button onClick={() => removeMedia('videos', i)} className="text-red-500 text-xs flex items-center gap-1"><Trash2 className="w-3 h-3" /> Supprimer</button>
                    </div>
                  ))}
                </div>

                {/* Audios */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#1A1A24] flex items-center gap-2"><Music className="w-4 h-4" /> Audio ({form.audios.length})</h3>
                    <button onClick={() => addMedia('audios')} className="btn-ghost text-sm"><Plus className="w-4 h-4" /> Ajouter</button>
                  </div>
                  {form.audios.length === 0 && <p className="text-sm text-[#9090A8] italic">Aucun audio ajouté</p>}
                  {form.audios.map((a, i) => (
                    <div key={i} className="border border-black/[0.08] rounded-2xl p-4 mb-3 space-y-3">
                      <MediaInput type="video" label="Audio (SoundCloud/Spotify en lien, ou fichier MP3)" value={a.url}
                        onChange={url => updateMedia('audios', i, 'url', url)} />
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={labelClass}>Titre</label><input value={a.caption} onChange={e => updateMedia('audios', i, 'caption', e.target.value)} className={inputClass} /></div>
                        <div><label className={labelClass}>Artiste / Source</label><input value={a.credit} onChange={e => updateMedia('audios', i, 'credit', e.target.value)} className={inputClass} /></div>
                      </div>
                      <button onClick={() => removeMedia('audios', i)} className="text-red-500 text-xs flex items-center gap-1"><Trash2 className="w-3 h-3" /> Supprimer</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Tab: Géolocalisation ── */}
            {tab === 'geo' && (
              <div className="space-y-5">
                <h2 className="font-display font-bold text-xl text-[#1A1A24]">Géolocalisation</h2>
                <p className="text-sm text-[#5A5A6E]">
                  Ajoutez les coordonnées GPS précises pour que l'entrée apparaisse sur la carte interactive.
                  Utilisez <a href="https://www.google.com/maps" target="_blank" className="text-brand-rouge underline">Google Maps</a> pour obtenir les coordonnées.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}><MapPin className="w-3 h-3 inline mr-1" /> Latitude</label>
                    <input value={form.latitude} onChange={e => set('latitude', e.target.value)}
                      placeholder="ex: 18.5432" type="number" step="0.000001" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}><MapPin className="w-3 h-3 inline mr-1" /> Longitude</label>
                    <input value={form.longitude} onChange={e => set('longitude', e.target.value)}
                      placeholder="ex: -72.3388" type="number" step="0.000001" className={inputClass} />
                  </div>
                </div>

                {form.latitude && form.longitude && (
                  <div className="bg-black/[0.03] rounded-2xl p-4 border border-black/[0.06]">
                    <p className="text-sm text-[#5A5A6E] mb-3">Aperçu de la position :</p>
                    <a href={`https://www.google.com/maps?q=${form.latitude},${form.longitude}`}
                       target="_blank" className="btn-ghost text-sm inline-flex">
                      <MapPin className="w-4 h-4" /> Voir sur Google Maps
                    </a>
                  </div>
                )}

                <div className="bg-brand-rouge/[0.04] rounded-2xl p-5 border border-brand-rouge/10">
                  <h3 className="font-semibold text-sm text-[#1A1A24] mb-2">💡 Comment obtenir les coordonnées</h3>
                  <ol className="text-sm text-[#5A5A6E] space-y-1 list-decimal list-inside">
                    <li>Ouvre Google Maps et trouve le lieu</li>
                    <li>Fais un clic droit sur l'emplacement exact</li>
                    <li>Clique sur les coordonnées affichées pour les copier</li>
                    <li>Colle-les ici (latitude, longitude)</li>
                  </ol>
                </div>
              </div>
            )}

            {/* ── Tab: Timeline ── */}
            {tab === 'timeline' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-xl text-[#1A1A24]">Timeline historique</h2>
                  <button onClick={addEvent} className="btn-primary text-sm"><Plus className="w-4 h-4" /> Ajouter un événement</button>
                </div>
                <p className="text-sm text-[#5A5A6E]">Ajoutez les dates et événements clés de l'histoire de cette entrée.</p>

                {form.timeline.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-black/[0.08] rounded-2xl">
                    <Clock className="w-10 h-10 text-[#9090A8] mx-auto mb-3 opacity-40" />
                    <p className="text-[#9090A8] text-sm">Aucun événement — cliquez sur "Ajouter" pour commencer</p>
                  </div>
                )}

                <div className="space-y-4">
                  {form.timeline
                    .slice()
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((ev, i) => (
                    <div key={i} className="border border-black/[0.08] rounded-2xl p-5 space-y-3 relative">
                      <div className="absolute -left-3 top-5 w-6 h-6 rounded-full bg-brand-rouge text-white text-xs flex items-center justify-center font-bold">
                        {i + 1}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className={labelClass}>Date</label>
                          <input value={ev.date} onChange={e => updateEvent(i, 'date', e.target.value)}
                            placeholder="ex: 1968, 1968-03, 1968-03-15" className={inputClass} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className={labelClass}>Titre de l'événement</label>
                          <input value={ev.titre} onChange={e => updateEvent(i, 'titre', e.target.value)}
                            placeholder="ex: Fondation du groupe" className={inputClass} />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Description</label>
                        <textarea value={ev.description} onChange={e => updateEvent(i, 'description', e.target.value)}
                          rows={2} className={inputClass + ' resize-none'} />
                      </div>
                      <button onClick={() => removeEvent(i)} className="text-red-500 text-xs flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> Supprimer
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Tab: Sources ── */}
            {tab === 'sources' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-xl text-[#1A1A24]">Sources & Références</h2>
                  <button onClick={addSource} className="btn-primary text-sm"><Plus className="w-4 h-4" /> Ajouter</button>
                </div>
                <p className="text-sm text-[#5A5A6E]">Citez vos sources pour valider l'information (livre, article, site, archive...).</p>

                {form.sources.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-black/[0.08] rounded-2xl">
                    <BookOpen className="w-10 h-10 text-[#9090A8] mx-auto mb-3 opacity-40" />
                    <p className="text-[#9090A8] text-sm">Aucune source — ajoutez des références pour valider l'entrée</p>
                  </div>
                )}

                {form.sources.map((src, i) => (
                  <div key={i} className="border border-black/[0.08] rounded-2xl p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className={labelClass}>Titre de la source</label>
                        <input value={src.titre} onChange={e => updateSource(i, 'titre', e.target.value)} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Type</label>
                        <select value={src.type} onChange={e => updateSource(i, 'type', e.target.value)} className={inputClass}>
                          <option value="web">Site web</option>
                          <option value="livre">Livre</option>
                          <option value="article">Article</option>
                          <option value="archive">Archive</option>
                          <option value="video">Vidéo</option>
                          <option value="autre">Autre</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>URL (optionnel)</label>
                      <input value={src.url} onChange={e => updateSource(i, 'url', e.target.value)} placeholder="https://..." className={inputClass} />
                    </div>
                    <button onClick={() => removeSource(i)} className="text-red-500 text-xs flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Supprimer
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ── Tab: Traductions ── */}
            {tab === 'traductions' && (
              <div className="space-y-6">
                <h2 className="font-display font-bold text-xl text-[#1A1A24]">Traductions</h2>
                <p className="text-sm text-[#5A5A6E]">
                  Traduisez l'entrée en créole haïtien et en anglais pour maximiser son impact international.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Kreyòl */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-[#1A1A24] flex items-center gap-2">
                      🇭🇹 Kreyòl ayisyen
                    </h3>
                    <div>
                      <label className={labelClass}>Nom en créole</label>
                      <input value={form.nom_ht} onChange={e => set('nom_ht', e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Description en créole</label>
                      <textarea value={form.description_ht} onChange={e => set('description_ht', e.target.value)}
                        rows={8} className={inputClass + ' resize-none'} />
                    </div>
                  </div>

                  {/* English */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-[#1A1A24] flex items-center gap-2">
                      🇬🇧 English
                    </h3>
                    <div>
                      <label className={labelClass}>Name in English</label>
                      <input value={form.nom_en} onChange={e => set('nom_en', e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Description in English</label>
                      <textarea value={form.description_en} onChange={e => set('description_en', e.target.value)}
                        rows={8} className={inputClass + ' resize-none'} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Save bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-black/[0.06] shadow-lg z-40">
            <div className="section py-4 flex items-center justify-between">
              <span className="text-sm text-[#9090A8]">
                Entrée : <strong className="text-[#1A1A24]">{form.nom}</strong>
              </span>
              <div className="flex gap-3">
                <Link href={`/entry/${params.slug}`} className="btn-ghost text-sm">
                  Annuler
                </Link>
                <button onClick={save} disabled={saving}
                  className="btn-primary text-sm px-6 disabled:opacity-40">
                  {saving
                    ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full" /> Enregistrement...</>
                    : <><Save className="w-4 h-4" /> Enregistrer</>
                  }
                </button>
              </div>
            </div>
          </div>
          <div className="h-20" />
        </div>
      </main>
    </>
  )
}
