'use client'
// src/app/map/page.tsx
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Search, Filter, X, MapPin, Layers } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import { CATEGORIES } from '@/lib/categories'

const CATEGORY_COLORS: Record<string, string> = {
  arts_spectacle: '#C1001F',
  patrimoine_oral: '#8B5A2B',
  gastronomie_savoirs: '#D4A017',
  artisanat_arts_visuels: '#00235B',
  spiritualites_rituels: '#6B2D5C',
  patrimoine_linguistique: '#1E7A5C',
  jeux_sports: '#E07A1F',
  fetes_manifestations: '#C1001F',
  patrimoine_bati: '#5A5A6E',
  patrimoine_materiel: '#8B5A2B',
  musees_galeries: '#00235B',
  bibliotheques_archives: '#1E7A5C',
  edition_presse: '#6B2D5C',
  medias_diffusion: '#E07A1F',
  industries_creatives: '#C1001F',
  formation_transmission: '#00235B',
  infrastructures_culturelles: '#5A5A6E',
}

interface MapPoint {
  id: number; slug: string; nom: string; type: string
  discipline: string; ville: string; pays: string
  image_url: string | null; latitude: number; longitude: number
  description: string; category: string
}

export default function MapPage() {
  const mapRef = useRef<any>(null)
  const leafletRef = useRef<any>(null)
  const [points, setPoints] = useState<MapPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [selected, setSelected] = useState<MapPoint | null>(null)
  const [count, setCount] = useState(0)
  const [mapReady, setMapReady] = useState(false)

  // Load map
  useEffect(() => {
    if (typeof window === 'undefined') return
    import('leaflet').then(L => {
      leafletRef.current = L.default ?? L

      // Fix default marker icons
      const LD = leafletRef.current
      delete (LD.Icon.Default.prototype as any)._getIconUrl
      LD.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if (!mapRef.current && document.getElementById('cultupedia-map')) {
        const map = LD.map('cultupedia-map', {
          center: [18.9712, -72.2852], // Centre d'Haïti
          zoom: 7,
          zoomControl: true,
        })

        LD.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map)

        mapRef.current = map
        setMapReady(true)
      }
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Load points
  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (q) params.set('q', q)

    fetch(`/api/map?${params}`)
      .then(r => r.json())
      .then(d => {
        setPoints(d.points ?? [])
        setCount(d.points?.length ?? 0)
      })
      .finally(() => setLoading(false))
  }, [category, q])

  // Add markers to map
  useEffect(() => {
    if (!mapReady || !leafletRef.current || !mapRef.current) return
    const L = leafletRef.current
    const map = mapRef.current

    // Clear existing markers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        map.removeLayer(layer)
      }
    })

    // Add new markers
    points.forEach(pt => {
      const color = CATEGORY_COLORS[pt.category ?? pt.discipline] ?? '#C1001F'

      const marker = L.circleMarker([pt.latitude, pt.longitude], {
        radius: 7,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85,
      }).addTo(map)

      marker.on('click', () => setSelected(pt))
      marker.bindTooltip(pt.nom, { permanent: false, direction: 'top', className: 'leaflet-tooltip-cultupedia' })
    })
  }, [points, mapReady])

  return (
    <>
      <Navbar lang="fr" />
      <div className="fixed inset-0 pt-16 md:pt-20 flex flex-col">

        {/* Toolbar */}
        <div className="bg-white border-b border-black/[0.06] shadow-sm z-10 px-4 py-3 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9090A8]" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-black/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-rouge" />
            {q && <button onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-[#9090A8]" /></button>}
          </div>

          <div className="relative">
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="pl-8 pr-4 py-2 text-sm border border-black/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-rouge appearance-none bg-white">
              <option value="">Toutes les catégories</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label.fr}</option>)}
            </select>
            <Layers className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9090A8] pointer-events-none" />
          </div>

          <div className="flex items-center gap-2 text-sm text-[#5A5A6E]">
            <MapPin className="w-4 h-4 text-brand-rouge" />
            <span><strong className="text-[#1A1A24]">{loading ? '...' : count}</strong> entrées géolocalisées</span>
          </div>
        </div>

        {/* Map container */}
        <div className="flex-1 relative">
          <div id="cultupedia-map" className="w-full h-full" />

          {/* Legend */}
          <div className="absolute bottom-6 left-4 bg-white rounded-2xl shadow-lg border border-black/[0.08] p-4 max-w-[220px] z-[1000]">
            <p className="text-xs font-bold text-[#9090A8] uppercase tracking-wide mb-3">Catégories</p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {CATEGORIES.filter(c =>
                ['arts_spectacle', 'gastronomie_savoirs', 'artisanat_arts_visuels', 'fetes_manifestations', 'industries_creatives', 'edition_presse', 'medias_diffusion'].includes(c.id)
              ).map(c => (
                <button key={c.id} onClick={() => setCategory(category === c.id ? '' : c.id)}
                  className={`flex items-center gap-2 w-full text-left transition-opacity ${category && category !== c.id ? 'opacity-40' : ''}`}>
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[c.id] }} />
                  <span className="text-xs text-[#3A3A50] leading-tight">{c.emoji} {c.label.fr}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected entry popup */}
          {selected && (
            <div className="absolute top-4 right-4 bg-white rounded-2xl shadow-xl border border-black/[0.08] p-5 w-72 z-[1000]">
              <button onClick={() => setSelected(null)} className="absolute top-3 right-3 text-[#9090A8] hover:text-[#1A1A24]">
                <X className="w-4 h-4" />
              </button>
              {selected.image_url && (
                <img src={selected.image_url} alt={selected.nom}
                  className="w-full h-36 object-cover rounded-xl mb-4" />
              )}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: `${CATEGORY_COLORS[selected.category ?? selected.discipline]}15`, color: CATEGORY_COLORS[selected.category ?? selected.discipline] }}>
                  {CATEGORIES.find(c => c.id === (selected.category ?? selected.discipline))?.emoji} {selected.type}
                </span>
              </div>
              <h3 className="font-display font-bold text-[#1A1A24] text-lg leading-tight mb-1">{selected.nom}</h3>
              {selected.ville && (
                <p className="text-xs text-[#9090A8] flex items-center gap-1 mb-3">
                  <MapPin className="w-3 h-3" /> {selected.ville}, {selected.pays}
                </p>
              )}
              {selected.description && (
                <p className="text-sm text-[#5A5A6E] leading-relaxed line-clamp-3 mb-4">{selected.description}</p>
              )}
              <Link href={`/entry/${selected.slug}`}
                className="btn-primary w-full justify-center text-sm py-2.5">
                Voir la fiche →
              </Link>
            </div>
          )}

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-[999]">
              <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-3">
                <span className="animate-spin inline-block w-5 h-5 border-2 border-brand-rouge/30 border-t-brand-rouge rounded-full" />
                <span className="text-sm text-[#5A5A6E]">Chargement de la carte...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .leaflet-tooltip-cultupedia {
          background: #1A1A24;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .leaflet-tooltip-cultupedia::before { border-top-color: #1A1A24; }
      `}</style>
    </>
  )
}
