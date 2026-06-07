'use client'
// src/components/search/SearchPage.tsx
import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X, ChevronDown, Grid3X3, List } from 'lucide-react'
import EntryCard from '@/components/profile/EntryCard'
import { DISCIPLINES, REGIONS, SORT_OPTIONS } from '@/lib/config'
import { cn } from '@/lib/utils'
import type { Entry, Facets, Discipline } from '@/types'

interface SearchResult {
  entries: Entry[]
  total: number
  page: number
  totalPages: number
  facets: Facets
}

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // État des filtres
  const [q,          setQ]          = useState(searchParams.get('q')          ?? '')
  const [discipline, setDiscipline] = useState(searchParams.get('discipline') ?? '')
  const [region,     setRegion]     = useState(searchParams.get('region')     ?? '')
  const [statut,     setStatut]     = useState(searchParams.get('statut')     ?? '')
  const [pays,       setPays]       = useState(searchParams.get('pays')       ?? '')
  const [sort,       setSort]       = useState(searchParams.get('sort')       ?? 'created_at:desc')
  const [page,       setPage]       = useState(parseInt(searchParams.get('page') ?? '1'))
  const [view,       setView]       = useState<'grid'|'list'>('grid')
  const [filtersOpen, setFiltersOpen] = useState(false)

  // État résultats
  const [result,  setResult]  = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchResults = useCallback(async () => {
    setLoading(true)
    try {
      const [sortField, sortOrder] = sort.split(':')
      const params = new URLSearchParams({
        ...(q          && { q }),
        ...(discipline && { discipline }),
        ...(region     && { region }),
        ...(statut     && { statut }),
        ...(pays       && { pays }),
        sort: sortField,
        order: sortOrder ?? 'desc',
        page: String(page),
        limit: '24',
      })
      const res  = await fetch(`/api/entries?${params}`)
      const data = await res.json()
      setResult(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [q, discipline, region, statut, pays, sort, page])

  useEffect(() => { fetchResults() }, [fetchResults])

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (q)          params.set('q', q)
    if (discipline) params.set('discipline', discipline)
    if (region)     params.set('region', region)
    if (statut)     params.set('statut', statut)
    if (pays)       params.set('pays', pays)
    if (sort !== 'created_at:desc') params.set('sort', sort)
    if (page > 1)   params.set('page', String(page))
    router.replace(`/search?${params}`, { scroll: false })
  }, [q, discipline, region, statut, pays, sort, page, router])

  function clearFilters() {
    setDiscipline(''); setRegion(''); setStatut(''); setPays('')
    setSort('created_at:desc'); setPage(1)
  }

  const activeFiltersCount = [discipline, region, statut, pays].filter(Boolean).length

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    fetchResults()
  }

  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="section">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-[#1A1A24] mb-2">Recherche</h1>
          <p className="text-[#9090A8] text-sm">
            {result ? `${result.total.toLocaleString('fr')} entrées dans la base` : 'Recherche en cours...'}
          </p>
        </div>

        {/* Barre recherche */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9090A8]" />
            <input
              type="text"
              value={q}
              onChange={e => { setQ(e.target.value); setPage(1) }}
              placeholder="Artiste, groupe, festival, ville, tag..."
              className="search-input"
            />
            {q && (
              <button type="button" onClick={() => { setQ(''); setPage(1) }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9090A8] hover:text-[#1A1A24]">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button type="submit" className="btn-primary px-6">
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Chercher</span>
          </button>
          <button
            type="button"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={cn('btn-secondary px-4 relative', activeFiltersCount > 0 && 'border-brand-rouge/40 text-brand-rouge')}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filtres</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-brand-rouge text-white text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </form>

        {/* Panneau filtres */}
        {filtersOpen && (
          <div className="bg-white rounded-2xl border border-black/[0.08] shadow-card p-6 mb-6 animate-fade-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-[#1A1A24]">Filtres</h3>
              {activeFiltersCount > 0 && (
                <button onClick={clearFilters} className="text-sm text-brand-rouge hover:underline flex items-center gap-1">
                  <X className="w-3.5 h-3.5" /> Effacer
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Discipline */}
              <div>
                <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-2 block">
                  Discipline
                </label>
                <select value={discipline} onChange={e => { setDiscipline(e.target.value); setPage(1) }}
                        className="filter-select w-full">
                  <option value="">Toutes</option>
                  {DISCIPLINES.map(d => (
                    <option key={d.id} value={d.id}>{d.emoji} {d.label.fr}</option>
                  ))}
                </select>
              </div>

              {/* Région */}
              <div>
                <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-2 block">
                  Région
                </label>
                <select value={region} onChange={e => { setRegion(e.target.value); setPage(1) }}
                        className="filter-select w-full">
                  <option value="">Toutes</option>
                  {REGIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Statut */}
              <div>
                <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-2 block">
                  Statut
                </label>
                <select value={statut} onChange={e => { setStatut(e.target.value); setPage(1) }}
                        className="filter-select w-full">
                  <option value="">Tous</option>
                  <option value="en_cours">Actif</option>
                  <option value="archive">Archive</option>
                  <option value="en_projet">En projet</option>
                  <option value="fermé">Fermé</option>
                </select>
              </div>

              {/* Tri */}
              <div>
                <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-2 block">
                  Trier par
                </label>
                <select value={sort} onChange={e => { setSort(e.target.value); setPage(1) }}
                        className="filter-select w-full">
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label.fr}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filtres rapides disciplines */}
            <div className="mt-5 flex flex-wrap gap-2">
              {DISCIPLINES.map(d => (
                <button
                  key={d.id}
                  onClick={() => { setDiscipline(discipline === d.id ? '' : d.id); setPage(1) }}
                  className={cn('tag text-xs', discipline === d.id && 'active')}
                >
                  {d.emoji} {d.label.fr}
                  {result?.facets.disciplines.find(f => f.value === d.id)?.count
                    ? ` (${result.facets.disciplines.find(f => f.value === d.id)!.count.toLocaleString('fr')})`
                    : ''}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Barre résultats + vue */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-[#5A5A6E]">
            {loading ? 'Recherche...' : (
              result ? (
                <span>
                  <strong className="text-[#1A1A24]">{result.total.toLocaleString('fr')}</strong> résultat{result.total > 1 ? 's' : ''}
                  {q && <span className="text-brand-rouge"> pour « {q} »</span>}
                </span>
              ) : null
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setView('grid')} className={cn('p-2 rounded-lg transition-colors', view === 'grid' ? 'bg-black/[0.08]' : 'hover:bg-black/[0.04]')}>
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button onClick={() => setView('list')} className={cn('p-2 rounded-lg transition-colors', view === 'list' ? 'bg-black/[0.08]' : 'hover:bg-black/[0.04]')}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Résultats */}
        {loading ? (
          <div className={cn('grid gap-5', view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1')}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton h-64 rounded-2xl" />
            ))}
          </div>
        ) : !result || result.entries.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-display font-bold text-xl text-[#1A1A24] mb-2">Aucun résultat</h3>
            <p className="text-[#9090A8] mb-6">Essayez d'autres mots-clés ou effacez les filtres</p>
            <button onClick={clearFilters} className="btn-primary">Effacer les filtres</button>
          </div>
        ) : (
          <>
            <div className={cn(
              'grid gap-5',
              view === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            )}>
              {result.entries.map(entry => (
                <EntryCard key={entry.id} entry={entry} compact={view === 'list'} />
              ))}
            </div>

            {/* Pagination */}
            {result.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-ghost disabled:opacity-40"
                >
                  ← Préc.
                </button>
                {Array.from({ length: Math.min(result.totalPages, 7) }, (_, i) => {
                  const p = result.totalPages <= 7
                    ? i + 1
                    : page <= 4 ? i + 1
                    : page >= result.totalPages - 3 ? result.totalPages - 6 + i
                    : page - 3 + i
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={cn(
                        'w-10 h-10 rounded-xl text-sm font-semibold transition-colors',
                        p === page
                          ? 'bg-brand-rouge text-white'
                          : 'hover:bg-black/[0.06] text-[#5A5A6E]'
                      )}
                    >
                      {p}
                    </button>
                  )
                })}
                <button
                  onClick={() => setPage(p => Math.min(result.totalPages, p + 1))}
                  disabled={page === result.totalPages}
                  className="btn-ghost disabled:opacity-40"
                >
                  Suiv. →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
