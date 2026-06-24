'use client'
// src/app/map/page.tsx
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Search, X, MapPin, Layers } from 'lucide-react'
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
  const markersRef = useRef<any>(null)
  const [points, setPoints] = useState<MapPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [selected, setSelected] = useState<MapPoint | null>(null)
  const [count, setCount] = useState(0)
  const [mapReady, setMapReady] = useState(false)

  // Init map once
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (mapRef.current) return

    import('leaflet').then(mod => {
      const L = mod.default ?? mod
      leafletRef.current = L

      // Fix icons
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const el = document.getElementById('cultupedia-map')
      if (!el) return

      const map = L.map(el, {
        center: [18.9712, -72.2852],
        zoom: 7,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      // Layer group for markers
      markersRef.current = L.layerGroup().addTo(map)

      mapRef.current = map
      setMapReady(true)
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markersRef.current = null
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

  // Update markers when points change
  useEffect(() => {
    if (!mapReady || !leafletRef.current || !markersRef.current) return
    const L = leafletRef.current

    // Clear markers
    markersRef.current.clearLayers()

    // Add markers
    points.forEach(pt => {
      const color = CATEGORY_COLORS[pt.category ?? pt.discipline] ?? '#C1001F'
      const marker = L.circleMarker([pt.latitude, pt.longitude], {
        radius: 7,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85,
      })
      marker.on('click', () => setSelected(pt))
      marker.bindTooltip(pt.nom, {
        permanent: false,
        direction: 'top',
        className: 'cmap-tooltip',
      })
      markersRef.current.addLayer(marker)
    })
  }, [points, mapReady])

  return (
    <>
      <Navbar lang="fr" />

      {/* Leaflet CSS */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, paddingTop: '80px', display: 'flex', flexDirection: 'column', zIndex: 10 }}>

        {/* Toolbar */}
        <div style={{ background: 'white', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '12px 16px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', zIndex: 20, flexShrink: 0 }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '180px', maxWidth: '300px' }}>
            <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9090A8' }} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher..."
              style={{ width: '100%', paddingLeft: 36, paddingRight: 16, paddingTop: 8, paddingBottom: 8, fontSize: 14, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 12, outline: 'none' }} />
            {q && <button onClick={() => setQ('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}><X style={{ width: 14, height: 14, color: '#9090A8' }} /></button>}
          </div>

          <div style={{ position: 'relative' }}>
            <Layers style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9090A8', pointerEvents: 'none' }} />
            <select value={category} onChange={e => setCategory(e.target.value)}
              style={{ paddingLeft: 28, paddingRight: 16, paddingTop: 8, paddingBottom: 8, fontSize: 14, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 12, outline: 'none', background: 'white', appearance: 'none' }}>
              <option value="">Toutes les catégories</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label.fr}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#5A5A6E' }}>
            <MapPin style={{ width: 16, height: 16, color: '#C1001F' }} />
            <span><strong style={{ color: '#1A1A24' }}>{loading ? '...' : count}</strong> entrées géolocalisées</span>
          </div>
        </div>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
          <div id="cultupedia-map" style={{ width: '100%', height: '100%' }} />

          {/* Legend */}
          <div style={{ position: 'absolute', bottom: 24, left: 16, background: 'white', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.08)', padding: 16, maxWidth: 220, zIndex: 1000, maxHeight: 280, overflowY: 'auto' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#9090A8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Catégories</p>
            {CATEGORIES.filter(c => ['arts_spectacle', 'gastronomie_savoirs', 'artisanat_arts_visuels', 'fetes_manifestations', 'industries_creatives', 'edition_presse', 'medias_diffusion', 'infrastructures_culturelles'].includes(c.id)).map(c => (
              <button key={c.id} onClick={() => setCategory(category === c.id ? '' : c.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '4px 0', background: 'none', border: 'none', cursor: 'pointer', opacity: category && category !== c.id ? 0.4 : 1 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: CATEGORY_COLORS[c.id] }} />
                <span style={{ fontSize: 11, color: '#3A3A50', lineHeight: 1.3 }}>{c.emoji} {c.label.fr}</span>
              </button>
            ))}
          </div>

          {/* Selected popup */}
          {selected && (
            <div style={{ position: 'absolute', top: 16, right: 16, background: 'white', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.08)', padding: 20, width: 280, zIndex: 1000 }}>
              <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#9090A8' }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
              {selected.image_url && (
                <img src={selected.image_url} alt={selected.nom}
                  style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 12, marginBottom: 12 }} />
              )}
              <span style={{ fontSize: 10, fontWeight: 700, color: CATEGORY_COLORS[selected.category ?? selected.discipline], textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {selected.type}
              </span>
              <h3 style={{ fontWeight: 700, fontSize: 17, color: '#1A1A24', margin: '4px 0 4px', lineHeight: 1.2 }}>{selected.nom}</h3>
              {selected.ville && (
                <p style={{ fontSize: 12, color: '#9090A8', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
                  <MapPin style={{ width: 12, height: 12 }} /> {selected.ville}, {selected.pays}
                </p>
              )}
              {selected.description && (
                <p style={{ fontSize: 13, color: '#5A5A6E', lineHeight: 1.5, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {selected.description}
                </p>
              )}
              <Link href={`/entry/${selected.slug}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#C1001F', color: 'white', borderRadius: 12, padding: '10px 16px', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                Voir la fiche →
              </Link>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
              <div style={{ background: 'white', borderRadius: 16, padding: '20px 28px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 20, height: 20, border: '2px solid rgba(193,0,31,0.2)', borderTopColor: '#C1001F', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ fontSize: 14, color: '#5A5A6E' }}>Chargement de la carte...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .cmap-tooltip {
          background: #1A1A24 !important;
          color: white !important;
          border: none !important;
          border-radius: 8px !important;
          padding: 4px 10px !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
        }
        .cmap-tooltip::before { border-top-color: #1A1A24 !important; }
      `}</style>
    </>
  )
}
