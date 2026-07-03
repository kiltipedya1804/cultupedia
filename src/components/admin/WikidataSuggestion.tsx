'use client'
// src/components/admin/WikidataSuggestion.tsx
import { useState } from 'react'
import { Sparkles, Check, X, ExternalLink, Loader2, AlertCircle } from 'lucide-react'

interface Suggestion {
  nom: string | null
  description: string | null
  description_en: string | null
  image_url: string | null
  lien: string | null
  pays: string | null
  latitude: number | null
  longitude: number | null
  annee: string | null
}

interface WikidataSuggestionProps {
  entryName: string
  onApply: (field: string, value: string) => void
}

export default function WikidataSuggestion({ entryName, onApply }: WikidataSuggestionProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    found: boolean
    suggestions?: Suggestion
    wikidata_url?: string
    wikipedia_url?: string
    other_results?: { id: string; label: string; description: string }[]
  } | null>(null)
  const [applied, setApplied] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')

  async function fetchSuggestions() {
    setLoading(true)
    setError('')
    setResult(null)
    setApplied(new Set())
    try {
      const res = await fetch(`/api/admin/wikidata?q=${encodeURIComponent(entryName)}`)
      const data = await res.json()
      setResult(data)
      if (!data.found) setError('Aucun résultat trouvé sur Wikidata pour cette entrée.')
    } catch {
      setError('Erreur de connexion à Wikidata.')
    } finally {
      setLoading(false)
    }
  }

  function apply(field: string, value: string | number | null) {
    if (!value) return
    onApply(field, String(value))
    setApplied(prev => new Set([...prev, field]))
  }

  function applyAll() {
    if (!result?.suggestions) return
    const s = result.suggestions
    const fields: [string, string | number | null][] = [
      ['description', s.description],
      ['image_url', s.image_url],
      ['lien', s.lien],
      ['pays', s.pays],
      ['latitude', s.latitude],
      ['longitude', s.longitude],
      ['annee', s.annee],
    ]
    fields.forEach(([k, v]) => { if (v) apply(k, v) })
  }

  const FIELD_LABELS: Record<string, string> = {
    description: '📝 Description',
    description_en: '🇬🇧 Description EN',
    image_url: '🖼️ Image',
    lien: '🔗 Site web',
    pays: '🌍 Pays',
    latitude: '📍 Latitude',
    longitude: '📍 Longitude',
    annee: '📅 Année',
  }

  return (
    <div className="border border-brand-rouge/20 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-brand-rouge/[0.04] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-rouge" />
          <span className="text-sm font-semibold text-[#1A1A24]">Suggestions Wikidata</span>
        </div>
        <button onClick={fetchSuggestions} disabled={loading}
          className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50">
          {loading
            ? <><Loader2 className="w-3 h-3 animate-spin" /> Recherche...</>
            : '✨ Suggérer automatiquement'}
        </button>
      </div>

      {/* Contenu */}
      <div className="p-4">
        {!result && !loading && (
          <p className="text-xs text-[#9090A8] text-center py-2">
            Cliquez pour obtenir des suggestions depuis Wikidata.<br />
            <span className="text-brand-rouge font-medium">Vous validez chaque champ avant d'appliquer.</span>
          </p>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {result?.found && result.suggestions && (
          <div className="space-y-3">
            {/* Sources */}
            <div className="flex gap-2 flex-wrap">
              {result.wikidata_url && (
                <a href={result.wikidata_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-brand-bleu hover:underline">
                  <ExternalLink className="w-3 h-3" /> Wikidata
                </a>
              )}
              {result.wikipedia_url && (
                <a href={result.wikipedia_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-brand-bleu hover:underline">
                  <ExternalLink className="w-3 h-3" /> Wikipedia FR
                </a>
              )}
            </div>

            {/* Bouton tout appliquer */}
            <button onClick={applyAll}
              className="w-full text-xs font-semibold py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200">
              ✅ Tout appliquer (à vérifier)
            </button>

            {/* Champs suggérés */}
            {Object.entries(result.suggestions).map(([field, value]) => {
              if (!value || field === 'nom') return null
              const isApplied = applied.has(field)
              return (
                <div key={field} className={`rounded-xl border p-3 transition-colors ${
                  isApplied ? 'border-emerald-200 bg-emerald-50' : 'border-black/[0.08] bg-white'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-[#9090A8] mb-1">
                        {FIELD_LABELS[field] ?? field}
                      </div>
                      {field === 'image_url' ? (
                        <img src={String(value)} alt="" className="w-full h-24 object-cover rounded-lg" 
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      ) : (
                        <p className="text-xs text-[#3A3A50] leading-relaxed line-clamp-3">{String(value)}</p>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {isApplied ? (
                        <span className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        </span>
                      ) : (
                        <button onClick={() => apply(field, value as any)}
                          className="w-7 h-7 rounded-full bg-brand-rouge/10 hover:bg-brand-rouge/20 flex items-center justify-center transition-colors"
                          title="Appliquer ce champ">
                          <Check className="w-3.5 h-3.5 text-brand-rouge" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Autres résultats */}
            {result.other_results && result.other_results.length > 0 && (
              <div className="pt-2 border-t border-black/[0.06]">
                <p className="text-xs font-semibold text-[#9090A8] mb-2">Autres correspondances :</p>
                {result.other_results.map(r => (
                  <a key={r.id} href={`https://www.wikidata.org/wiki/${r.id}`} target="_blank" rel="noopener noreferrer"
                    className="block text-xs text-[#5A5A6E] hover:text-brand-rouge py-1 transition-colors">
                    <span className="font-medium">{r.label}</span>
                    {r.description && <span className="text-[#9090A8]"> — {r.description}</span>}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
