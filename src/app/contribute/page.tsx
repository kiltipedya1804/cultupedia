'use client'
// src/app/contribute/page.tsx
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { CheckCircle, ArrowRight, Music, Film, Utensils, BookOpen, Palette, Theater, Users, Building, Mic, Star } from 'lucide-react'

const ENTRY_TYPES = [
  { id: 'artiste_solo',   label: 'Artiste solo',        icon: Mic,      disc: 'musique' },
  { id: 'groupe',         label: 'Groupe / Band',        icon: Music,    disc: 'musique' },
  { id: 'film',           label: 'Film / Documentaire',  icon: Film,     disc: 'cinema' },
  { id: 'festival',       label: 'Festival',             icon: Star,     disc: '' },
  { id: 'restaurant',     label: 'Restaurant',           icon: Utensils, disc: 'gastronomie' },
  { id: 'chef',           label: 'Chef cuisinier',       icon: Utensils, disc: 'gastronomie' },
  { id: 'institution',    label: 'Institution / ONG',    icon: Building, disc: '' },
  { id: 'salle',          label: 'Salle / Lieu culturel',icon: Theater,  disc: 'theatre' },
  { id: 'livre',          label: 'Livre / Publication',  icon: BookOpen, disc: 'edition' },
  { id: 'ecrivain',       label: 'Écrivain / Auteur',    icon: BookOpen, disc: 'edition' },
  { id: 'danseur',        label: 'Danseur / Compagnie',  icon: Users,    disc: 'danse' },
  { id: 'artiste_visuel', label: 'Artiste visuel',       icon: Palette,  disc: 'graffiti' },
  { id: 'collectif',      label: 'Collectif',            icon: Users,    disc: '' },
  { id: 'chanson',        label: 'Chanson / Album',      icon: Music,    disc: 'musique' },
  { id: 'autre',          label: 'Autre',                icon: Star,     disc: '' },
]

const DISCIPLINES = [
  { id: 'musique',     label: 'Musique',      emoji: '🎵' },
  { id: 'danse',       label: 'Danse',        emoji: '💃' },
  { id: 'cinema',      label: 'Cinéma',       emoji: '🎬' },
  { id: 'graffiti',    label: 'Arts Visuels', emoji: '🎨' },
  { id: 'theatre',     label: 'Théâtre',      emoji: '🎭' },
  { id: 'gastronomie', label: 'Gastronomie',  emoji: '🍽️' },
  { id: 'edition',     label: 'Édition',      emoji: '📚' },
]

const REGIONS = ['Caraïbes', 'Amérique du Nord', 'Amérique du Sud', 'Europe', 'Afrique', 'Asie', 'Océanie']
const STATUTS = [
  { id: 'en_cours', label: 'Actif / En cours' },
  { id: 'archive',  label: 'Archivé / Historique' },
  { id: 'en_projet',label: 'En projet' },
  { id: 'fermé',    label: 'Fermé / Disparu' },
]

export default function ContributePage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({
    nom: '', type: '', discipline: '', sous_discipline: '',
    statut: 'en_cours', annee: '', ville: '', pays: 'Haïti', region: 'Caraïbes',
    responsable: '', institution: '', description: '',
    tag: '', lien: '', rubrique: '', image_url: '',
    // Infos contributeur
    contributeur_nom: '', contributeur_email: '', contributeur_note: '',
  })

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Erreur lors de la soumission')
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
            <h1 className="font-display font-bold text-3xl text-[#1A1A24] mb-3">Contribution soumise !</h1>
            <p className="text-[#5A5A6E] mb-2">
              Merci pour votre contribution à Cultupedia.
            </p>
            <p className="text-[#5A5A6E] mb-8">
              Notre équipe va examiner votre soumission et la publier si elle respecte nos critères.
              Vous serez notifié par email.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/" className="btn-primary">← Accueil</Link>
              <button onClick={() => { setDone(false); setStep(1) }} className="btn-secondary">
                Ajouter une autre entrée
              </button>
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
            <div className="text-xs font-semibold text-brand-rouge uppercase tracking-widest mb-2">Contribution</div>
            <h1 className="font-display font-bold text-4xl text-[#1A1A24] mb-3">Ajouter une entrée</h1>
            <p className="text-[#5A5A6E] max-w-xl">
              Contribuez à l'encyclopédie culturelle haïtienne — artistes, films, restaurants,
              institutions, chansons, livres, festivals et bien plus. Chaque soumission est
              examinée par notre équipe avant publication.
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2">
            {['Type', 'Détails', 'Description', 'Vous'].map((label, i) => (
              <div key={i} className="flex items-center gap-2 flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i + 1 < step ? 'bg-emerald-500 text-white' :
                  i + 1 === step ? 'bg-brand-rouge text-white' :
                  'bg-black/[0.08] text-[#9090A8]'
                }`}>{i + 1 < step ? '✓' : i + 1}</div>
                <span className={`text-sm font-medium whitespace-nowrap ${i + 1 === step ? 'text-[#1A1A24]' : 'text-[#9090A8]'}`}>
                  {label}
                </span>
                {i < 3 && <div className="w-6 h-px bg-black/[0.12]" />}
              </div>
            ))}
          </div>

          <div className="card p-8">

            {/* Étape 1 — Type */}
            {step === 1 && (
              <div>
                <h2 className="font-display font-bold text-xl text-[#1A1A24] mb-6">
                  Quel type d'entrée voulez-vous ajouter ?
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                  {ENTRY_TYPES.map(t => (
                    <button key={t.id} onClick={() => {
                      set('type', t.id)
                      if (t.disc) set('discipline', t.disc)
                    }}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        form.type === t.id
                          ? 'border-brand-rouge bg-brand-rouge/[0.04]'
                          : 'border-black/[0.08] hover:border-black/20'
                      }`}
                    >
                      <t.icon className={`w-5 h-5 mb-2 ${form.type === t.id ? 'text-brand-rouge' : 'text-[#9090A8]'}`} />
                      <div className={`text-sm font-semibold leading-tight ${form.type === t.id ? 'text-brand-rouge' : 'text-[#1A1A24]'}`}>
                        {t.label}
                      </div>
                    </button>
                  ))}
                </div>

                <h2 className="font-display font-bold text-lg text-[#1A1A24] mb-4">Discipline</h2>
                <div className="flex flex-wrap gap-2 mb-8">
                  {DISCIPLINES.map(d => (
                    <button key={d.id} onClick={() => set('discipline', d.id)}
                      className={`tag text-sm ${form.discipline === d.id ? 'bg-brand-rouge text-white border-brand-rouge' : ''}`}>
                      {d.emoji} {d.label}
                    </button>
                  ))}
                </div>

                <button onClick={() => setStep(2)} disabled={!form.type || !form.discipline}
                  className="btn-primary w-full justify-center py-3.5 disabled:opacity-40">
                  Continuer <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Étape 2 — Détails */}
            {step === 2 && (
              <form onSubmit={e => { e.preventDefault(); setStep(3) }} className="space-y-5">
                <h2 className="font-display font-bold text-xl text-[#1A1A24] mb-6">Informations</h2>

                <div>
                  <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">Nom *</label>
                  <input value={form.nom} onChange={e => set('nom', e.target.value)} required
                    placeholder="Nom de l'entrée..." className="filter-select w-full text-sm py-3" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">Sous-discipline</label>
                    <input value={form.sous_discipline} onChange={e => set('sous_discipline', e.target.value)}
                      placeholder="ex: compas, rasin, jazz..." className="filter-select w-full text-sm py-3" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">Année</label>
                    <input value={form.annee} onChange={e => set('annee', e.target.value)}
                      placeholder="ex: 1968" className="filter-select w-full text-sm py-3" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">Statut</label>
                  <div className="flex flex-wrap gap-2">
                    {STATUTS.map(s => (
                      <button key={s.id} type="button" onClick={() => set('statut', s.id)}
                        className={`tag text-xs ${form.statut === s.id ? 'bg-brand-rouge text-white border-brand-rouge' : ''}`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
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
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">Responsable / Fondateur</label>
                    <input value={form.responsable} onChange={e => set('responsable', e.target.value)}
                      placeholder="Nom du responsable" className="filter-select w-full text-sm py-3" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">Institution</label>
                    <input value={form.institution} onChange={e => set('institution', e.target.value)}
                      placeholder="Institution associée" className="filter-select w-full text-sm py-3" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">Lien web</label>
                    <input value={form.lien} onChange={e => set('lien', e.target.value)}
                      placeholder="https://..." className="filter-select w-full text-sm py-3" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">Image URL</label>
                    <input value={form.image_url} onChange={e => set('image_url', e.target.value)}
                      placeholder="https://..." className="filter-select w-full text-sm py-3" />
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

            {/* Étape 3 — Description */}
            {step === 3 && (
              <form onSubmit={e => { e.preventDefault(); setStep(4) }} className="space-y-5">
                <h2 className="font-display font-bold text-xl text-[#1A1A24] mb-6">Description & Tags</h2>

                <div>
                  <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">
                    Description *
                  </label>
                  <textarea value={form.description} onChange={e => set('description', e.target.value)}
                    required rows={7} placeholder="Décrivez cette entrée en détail — histoire, importance culturelle, œuvres, récompenses..."
                    className="filter-select w-full text-sm resize-none py-3" />
                  <p className="text-xs text-[#9090A8] mt-1">{form.description.length} caractères — minimum recommandé : 100</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">
                    Tags <span className="normal-case font-normal text-[#9090A8]">(séparés par virgules)</span>
                  </label>
                  <input value={form.tag} onChange={e => set('tag', e.target.value)}
                    placeholder="compas, diaspora, prix, festival..." className="filter-select w-full text-sm py-3" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">Rubrique</label>
                  <input value={form.rubrique} onChange={e => set('rubrique', e.target.value)}
                    placeholder="biographie, discographie, filmographie..." className="filter-select w-full text-sm py-3" />
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1 justify-center py-3">← Retour</button>
                  <button type="submit" disabled={form.description.length < 20}
                    className="btn-primary flex-1 justify-center py-3 disabled:opacity-40">
                    Continuer <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Étape 4 — Contributeur */}
            {step === 4 && (
              <form onSubmit={submit} className="space-y-5">
                <h2 className="font-display font-bold text-xl text-[#1A1A24] mb-2">Vos coordonnées</h2>
                <p className="text-sm text-[#5A5A6E] mb-6">
                  Optionnel — pour vous notifier quand votre contribution est publiée.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">Votre nom</label>
                    <input value={form.contributeur_nom} onChange={e => set('contributeur_nom', e.target.value)}
                      placeholder="Votre nom" className="filter-select w-full text-sm py-3" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">Votre email</label>
                    <input type="email" value={form.contributeur_email} onChange={e => set('contributeur_email', e.target.value)}
                      placeholder="vous@email.com" className="filter-select w-full text-sm py-3" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">
                    Note pour les modérateurs <span className="normal-case font-normal">(optionnel)</span>
                  </label>
                  <textarea value={form.contributeur_note} onChange={e => set('contributeur_note', e.target.value)}
                    rows={3} placeholder="Source, contexte, raison de la contribution..."
                    className="filter-select w-full text-sm resize-none py-3" />
                </div>

                {/* Résumé */}
                <div className="bg-black/[0.03] rounded-2xl p-5 border border-black/[0.06]">
                  <h3 className="font-semibold text-sm text-[#1A1A24] mb-3">Résumé de la contribution</h3>
                  <div className="space-y-1.5 text-sm text-[#5A5A6E]">
                    <div><span className="font-medium text-[#1A1A24]">Entrée :</span> {form.nom}</div>
                    <div><span className="font-medium text-[#1A1A24]">Type :</span> {ENTRY_TYPES.find(t => t.id === form.type)?.label}</div>
                    <div><span className="font-medium text-[#1A1A24]">Discipline :</span> {DISCIPLINES.find(d => d.id === form.discipline)?.label}</div>
                    {form.ville && <div><span className="font-medium text-[#1A1A24]">Lieu :</span> {form.ville}, {form.pays}</div>}
                    <div><span className="font-medium text-[#1A1A24]">Description :</span> {form.description.slice(0, 80)}...</div>
                  </div>
                </div>

                <div className="bg-brand-rouge/[0.04] rounded-2xl p-4 border border-brand-rouge/10 text-sm text-[#5A5A6E]">
                  ℹ️ Votre soumission sera examinée par notre équipe avant publication. Les entrées
                  de mauvaise qualité ou hors sujet seront rejetées.
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(3)} className="btn-secondary flex-1 justify-center py-3">← Retour</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3.5">
                    {loading
                      ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full" /> Envoi...</>
                      : <>Soumettre ✓</>
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
