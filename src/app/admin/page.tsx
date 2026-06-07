'use client'
// src/app/admin/page.tsx
import { useState, useEffect, useRef } from 'react'
import { Upload, Plus, Search, Edit3, Trash2, RefreshCw, CheckCircle, AlertCircle, BarChart3 } from 'lucide-react'
import { DISCIPLINES } from '@/lib/config'
import { cn } from '@/lib/utils'
import type { Entry, Discipline } from '@/types'

const API_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY ?? ''

function useApi(key: string) {
  return {
    headers: { 'x-api-key': key, 'Content-Type': 'application/json' },
  }
}

// ── Tableau des entrées ──────────────────────────────────
function EntriesTable() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [disc, setDisc] = useState('')
  const { headers } = useApi(API_KEY)

  async function load() {
    setLoading(true)
    const params = new URLSearchParams({ limit: '50', ...(q && { q }), ...(disc && { discipline: disc }) })
    const res = await fetch(`/api/entries?${params}`)
    const data = await res.json()
    setEntries(data.entries ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [q, disc])

  async function del(slug: string) {
    if (!confirm('Supprimer cette entrée ?')) return
    await fetch(`/api/entries/${slug}`, { method: 'DELETE', headers })
    load()
  }

  return (
    <div className="bg-white rounded-2xl shadow-card border border-black/[0.06] overflow-hidden">
      <div className="p-5 border-b border-black/[0.06] flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9090A8]" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher..."
                 className="filter-select w-full pl-9 text-sm" />
        </div>
        <select value={disc} onChange={e => setDisc(e.target.value)} className="filter-select text-sm">
          <option value="">Toutes disciplines</option>
          {DISCIPLINES.map(d => <option key={d.id} value={d.id}>{d.emoji} {d.label.fr}</option>)}
        </select>
        <button onClick={load} className="btn-ghost p-2.5 rounded-xl"><RefreshCw className="w-4 h-4" /></button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-[#9090A8]">Chargement...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black/[0.02] border-b border-black/[0.06]">
              <tr>
                {['Nom','Type','Discipline','Ville / Pays','Statut','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#9090A8] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {entries.map(e => (
                <tr key={e.id} className="hover:bg-black/[0.02] transition-colors">
                  <td className="px-4 py-3 font-medium text-[#1A1A24] max-w-[200px] truncate">{e.nom}</td>
                  <td className="px-4 py-3 text-[#5A5A6E]">{e.type}</td>
                  <td className="px-4 py-3">
                    <span className="badge-disc text-[10px]"
                          style={{ background: `${DISCIPLINES.find(d=>d.id===e.discipline)?.color}15`,
                                   color: DISCIPLINES.find(d=>d.id===e.discipline)?.color }}>
                      {e.discipline}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#5A5A6E] text-xs">{[e.ville,e.pays].filter(Boolean).join(', ')}</td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full',
                      e.statut==='en_cours' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-500')}>
                      {e.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <a href={`/entry/${e.slug}`} target="_blank"
                         className="p-1.5 rounded-lg hover:bg-black/[0.06] text-[#9090A8] hover:text-brand-bleu transition-colors">
                        <Edit3 className="w-3.5 h-3.5" />
                      </a>
                      <button onClick={() => del(e.slug)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-[#9090A8] hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Import CSV ───────────────────────────────────────────
function ImportCSV() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle'|'uploading'|'done'|'error'>('idle')
  const [result, setResult] = useState<{processed:number;errors:number;total:number}|null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const { headers } = useApi(API_KEY)

  async function upload() {
    if (!file) return
    setStatus('uploading')
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'x-api-key': API_KEY },
        body: form,
      })
      const data = await res.json()
      if (data.success) { setResult(data); setStatus('done') }
      else setStatus('error')
    } catch { setStatus('error') }
  }

  return (
    <div className="bg-white rounded-2xl shadow-card border border-black/[0.06] p-6">
      <h3 className="font-display font-bold text-lg text-[#1A1A24] mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5 text-brand-rouge" /> Importer un CSV
      </h3>
      <p className="text-sm text-[#9090A8] mb-5">
        Format attendu : <code className="bg-black/[0.04] px-1.5 py-0.5 rounded text-xs font-mono">
          ID;Nom;Type;Discipline;Sous-discipline;Année;Statut;Ville;Pays;Région;...
        </code>
      </p>

      {/* Drop zone */}
      <div
        onClick={() => fileRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors',
          file ? 'border-brand-rouge/40 bg-brand-rouge/[0.03]' : 'border-black/10 hover:border-brand-rouge/30'
        )}
      >
        <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden"
               onChange={e => setFile(e.target.files?.[0] ?? null)} />
        {file ? (
          <div>
            <CheckCircle className="w-10 h-10 text-brand-rouge mx-auto mb-2" />
            <div className="font-semibold text-[#1A1A24]">{file.name}</div>
            <div className="text-sm text-[#9090A8]">{(file.size / 1024).toFixed(1)} KB</div>
          </div>
        ) : (
          <div>
            <Upload className="w-10 h-10 text-[#9090A8] mx-auto mb-2" />
            <div className="font-semibold text-[#1A1A24]">Cliquer ou glisser un fichier CSV</div>
            <div className="text-sm text-[#9090A8] mt-1">Format séparateur point-virgule (;)</div>
          </div>
        )}
      </div>

      {file && status === 'idle' && (
        <button onClick={upload} className="btn-primary w-full mt-4 justify-center">
          <Upload className="w-4 h-4" /> Démarrer l'import
        </button>
      )}

      {status === 'uploading' && (
        <div className="mt-4 p-4 bg-brand-bleu/[0.06] rounded-xl text-center">
          <RefreshCw className="w-5 h-5 text-brand-bleu animate-spin mx-auto mb-2" />
          <p className="text-sm text-brand-bleu font-medium">Import en cours...</p>
        </div>
      )}

      {status === 'done' && result && (
        <div className="mt-4 p-4 bg-emerald-50 rounded-xl">
          <div className="flex items-center gap-2 text-emerald-600 font-semibold mb-1">
            <CheckCircle className="w-4 h-4" /> Import terminé
          </div>
          <div className="text-sm text-emerald-700">
            {result.processed.toLocaleString('fr')} entrées importées
            {result.errors > 0 && ` · ${result.errors} erreurs`}
            {' '}sur {result.total.toLocaleString('fr')} total
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 p-4 bg-red-50 rounded-xl flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> Erreur lors de l'import. Vérifiez le format du fichier.
        </div>
      )}
    </div>
  )
}

// ── Nouvelle entrée ──────────────────────────────────────
function NewEntryForm() {
  const [form, setForm] = useState({
    nom:'', type:'artiste_solo', discipline:'musique' as Discipline,
    sous_discipline:'', annee:'', statut:'en_cours',
    ville:'', pays:'Haïti', region:'Caraïbes', description:'',
  })
  const [status, setStatus] = useState<'idle'|'saving'|'done'|'error'>('idle')

  async function save() {
    setStatus('saving')
    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) setStatus('done')
      else setStatus('error')
    } catch { setStatus('error') }
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value })),
  })

  const inputClass = "filter-select w-full text-sm"
  const labelClass = "text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block"

  return (
    <div className="bg-white rounded-2xl shadow-card border border-black/[0.06] p-6">
      <h3 className="font-display font-bold text-lg text-[#1A1A24] mb-5 flex items-center gap-2">
        <Plus className="w-5 h-5 text-brand-rouge" /> Nouvelle entrée
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className={labelClass}>Nom *</label>
          <input {...field('nom')} placeholder="Nom de l'entrée" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Type</label>
          <select {...field('type')} className={inputClass}>
            {['artiste_solo','groupe','orchestre','festival','collectif','label','studio','media','institution','mouvement','lieu','organisation','restaurant','galerie','auteur','maison','film'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Discipline</label>
          <select {...field('discipline')} className={inputClass}>
            {DISCIPLINES.map(d => <option key={d.id} value={d.id}>{d.emoji} {d.label.fr}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Sous-discipline</label>
          <input {...field('sous_discipline')} placeholder="ex: compas, rasin..." className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Année</label>
          <input {...field('annee')} placeholder="ex: 1968" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Statut</label>
          <select {...field('statut')} className={inputClass}>
            <option value="en_cours">Actif</option>
            <option value="archive">Archive</option>
            <option value="en_projet">En projet</option>
            <option value="fermé">Fermé</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Ville</label>
          <input {...field('ville')} placeholder="ex: Port-au-Prince" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Pays</label>
          <input {...field('pays')} placeholder="ex: Haïti" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Région</label>
          <select {...field('region')} className={inputClass}>
            {['Caraïbes','Amérique du Nord','Amérique du Sud','Europe','Afrique','Asie','Océanie'].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Description</label>
          <textarea {...field('description')} rows={4} placeholder="Description culturelle..."
                    className="filter-select w-full text-sm resize-none" />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-5">
        <button onClick={save} disabled={!form.nom || status === 'saving'} className="btn-primary disabled:opacity-50">
          {status === 'saving' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Enregistrer
        </button>
        {status === 'done' && <span className="text-emerald-600 text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Enregistré !</span>}
        {status === 'error' && <span className="text-red-500 text-sm flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Erreur</span>}
      </div>
    </div>
  )
}

// ── Page Admin principale ─────────────────────────────────
export default function AdminPage() {
  const [tab, setTab] = useState<'entries'|'import'|'new'>('entries')
  const [stats, setStats] = useState<Record<string,number>>({})

  useEffect(() => {
    fetch('/api/stats').then(r=>r.json()).then(d=>{
      if (d.data?.by_discipline) setStats(d.data.by_discipline)
    })
  }, [])

  const tabs = [
    { id: 'entries', label: 'Entrées',       icon: BarChart3 },
    { id: 'import',  label: 'Importer CSV',   icon: Upload    },
    { id: 'new',     label: 'Nouvelle entrée',icon: Plus      },
  ] as const

  return (
    <main className="min-h-screen bg-brand-creme">
      {/* Header admin */}
      <div className="bg-brand-noir text-white py-6 px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col w-7 h-7 rounded overflow-hidden flex-shrink-0">
            <div className="flex-1 bg-brand-bleu-mid" />
            <div className="flex-1 bg-brand-rouge" />
          </div>
          <div>
            <div className="font-display font-bold text-lg">Cultupedia Admin</div>
            <div className="text-white/50 text-xs">Panneau d'administration</div>
          </div>
        </div>
        <a href="/" className="btn-ghost text-white/70 hover:text-white text-sm">← Site public</a>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats rapides */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          {DISCIPLINES.map(d => (
            <div key={d.id} className="bg-white rounded-xl p-4 shadow-sm border border-black/[0.06] text-center">
              <div className="text-xl mb-1">{d.emoji}</div>
              <div className="font-bold text-base" style={{ color: d.color }}>
                {(stats[d.id] ?? 0).toLocaleString('fr')}
              </div>
              <div className="text-xs text-[#9090A8] mt-0.5">{d.label.fr}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-black/[0.04] rounded-xl p-1 w-fit mb-8">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all',
                tab === t.id
                  ? 'bg-white text-[#1A1A24] shadow-sm'
                  : 'text-[#5A5A6E] hover:text-[#1A1A24]'
              )}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        {tab === 'entries' && <EntriesTable />}
        {tab === 'import'  && <ImportCSV />}
        {tab === 'new'     && <NewEntryForm />}
      </div>
    </main>
  )
}
