'use client'
// src/app/graph/page.tsx
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Search, X, ZoomIn, ZoomOut, Maximize2, Info } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import { CATEGORY_MAP } from '@/lib/categories'

interface GraphNode {
  id: number
  slug: string
  nom: string
  type: string
  discipline: string
  ville: string
  views: number
  featured: boolean
  category?: string
  x?: number
  y?: number
  vx?: number
  vy?: number
  fx?: number | null
  fy?: number | null
}

interface GraphLink {
  source: number | GraphNode
  target: number | GraphNode
  relation_type: string
}

interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

const CAT_COLORS: Record<string, string> = {
  arts_spectacle: '#C1001F',
  gastronomie_savoirs: '#D4A017',
  artisanat_arts_visuels: '#00235B',
  spiritualites_rituels: '#6B2D5C',
  fetes_manifestations: '#E07A1F',
  industries_creatives: '#C1001F',
  edition_presse: '#1E7A5C',
  medias_diffusion: '#8B5A2B',
  default: '#9090A8',
}

function getColor(node: GraphNode) {
  return CAT_COLORS[node.category ?? node.discipline] ?? CAT_COLORS.default
}

export default function GraphPage() {
  const svgRef = useRef<SVGSVGElement>(null)
  const simulationRef = useRef<any>(null)
  const [data, setData] = useState<GraphData | null>(null)
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<GraphNode | null>(null)
  const [nodeCount, setNodeCount] = useState(0)
  const [linkCount, setLinkCount] = useState(0)

  const buildGraph = useCallback(async (search: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('q', search)
      params.set('limit', '80')
      const res = await fetch(`/api/graph?${params}`)
      const d = await res.json()
      setData(d)
      setNodeCount(d.nodes?.length ?? 0)
      setLinkCount(d.links?.length ?? 0)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => buildGraph(q), 400)
    return () => clearTimeout(t)
  }, [q, buildGraph])

  useEffect(() => {
    if (!data || !svgRef.current || typeof window === 'undefined') return

    import('d3').then(d3 => {
      const svg = d3.select(svgRef.current!)
      svg.selectAll('*').remove()

      const el = svgRef.current!
      const W = el.clientWidth || 800
      const H = el.clientHeight || 600

      // Zoom
      const g = svg.append('g')
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 4])
        .on('zoom', (e) => g.attr('transform', e.transform))
      svg.call(zoom)

      // Simulation
      const nodes: GraphNode[] = data.nodes.map(n => ({ ...n }))
      const links: GraphLink[] = data.links.map(l => ({ ...l }))

      if (simulationRef.current) simulationRef.current.stop()

      const sim = d3.forceSimulation(nodes as any)
        .force('link', d3.forceLink(links).id((d: any) => d.id).distance(80).strength(0.3))
        .force('charge', d3.forceManyBody().strength(-200))
        .force('center', d3.forceCenter(W / 2, H / 2))
        .force('collision', d3.forceCollide().radius((d: any) => nodeRadius(d) + 4))

      simulationRef.current = sim

      // Links
      const link = g.append('g').selectAll('line')
        .data(links)
        .join('line')
        .attr('stroke', '#e0e0e0')
        .attr('stroke-width', 1)
        .attr('stroke-opacity', 0.6)

      // Nodes
      const node = g.append('g').selectAll('g')
        .data(nodes)
        .join('g')
        .attr('cursor', 'pointer')
        .call(d3.drag<any, any>()
          .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
          .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y })
          .on('end', (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null })
        )
        .on('click', (_e, d) => setSelected(d))

      node.append('circle')
        .attr('r', (d: any) => nodeRadius(d))
        .attr('fill', (d: any) => getColor(d))
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .attr('fill-opacity', 0.9)

      // Star for featured
      node.filter((d: any) => d.featured)
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-size', '8px')
        .text('⭐')

      node.append('text')
        .attr('dy', (d: any) => nodeRadius(d) + 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '9px')
        .attr('fill', '#3A3A50')
        .attr('font-weight', '600')
        .text((d: any) => d.nom.length > 18 ? d.nom.slice(0, 16) + '…' : d.nom)

      // Tick
      sim.on('tick', () => {
        link
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y)
        node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
      })
    })

    return () => { simulationRef.current?.stop() }
  }, [data])

  function nodeRadius(d: GraphNode) {
    return d.featured ? 14 : d.views > 100 ? 12 : d.views > 10 ? 9 : 7
  }

  const cat = selected?.category ? CATEGORY_MAP[selected.category] : null

  return (
    <>
      <Navbar lang="fr" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, paddingTop: '80px', display: 'flex', flexDirection: 'column', background: '#fafaf8' }}>

        {/* Toolbar */}
        <div style={{ background: 'white', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '12px 16px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', flexShrink: 0, zIndex: 20 }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '180px', maxWidth: '300px' }}>
            <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9090A8' }} />
            <input value={q} onChange={e => setQ(e.target.value)}
              placeholder="Rechercher un artiste, festival..."
              style={{ width: '100%', paddingLeft: 36, paddingRight: 36, paddingTop: 8, paddingBottom: 8, fontSize: 14, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 12, outline: 'none' }} />
            {q && <button onClick={() => setQ('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}><X style={{ width: 14, height: 14, color: '#9090A8' }} /></button>}
          </div>

          <div style={{ fontSize: 13, color: '#5A5A6E', display: 'flex', gap: 16 }}>
            <span>⬤ <strong style={{ color: '#1A1A24' }}>{nodeCount}</strong> entrées</span>
            <span>— <strong style={{ color: '#1A1A24' }}>{linkCount}</strong> connexions</span>
          </div>

          <div style={{ fontSize: 12, color: '#9090A8', display: 'flex', gap: 12 }}>
            <span>🖱️ Clic = sélectionner</span>
            <span>🤏 Glisser = déplacer</span>
            <span>🔍 Molette = zoom</span>
          </div>
        </div>

        {/* Graph */}
        <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
          {loading ? (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: 'white', borderRadius: 16, padding: '24px 32px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, border: '3px solid rgba(193,0,31,0.2)', borderTopColor: '#C1001F', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ fontSize: 14, color: '#5A5A6E' }}>Construction du graphe...</span>
              </div>
            </div>
          ) : (
            <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
          )}

          {/* Légende */}
          <div style={{ position: 'absolute', bottom: 24, left: 16, background: 'white', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.08)', padding: 14, zIndex: 100 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#9090A8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Taille des nœuds</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#C1001F', opacity: 0.85, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: '#3A3A50' }}>⭐ En vedette</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#9090A8', opacity: 0.85, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: '#3A3A50' }}>Vues élevées</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#9090A8', opacity: 0.85, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: '#3A3A50' }}>Standard</span>
              </div>
            </div>
          </div>

          {/* Selected node panel */}
          {selected && (
            <div style={{ position: 'absolute', top: 16, right: 16, background: 'white', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.08)', padding: 20, width: 260, zIndex: 100 }}>
              <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#9090A8' }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${getColor(selected)}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {cat?.emoji ?? '📌'}
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: getColor(selected), textTransform: 'uppercase', letterSpacing: '0.05em' }}>{selected.type}</div>
                  <h3 style={{ fontWeight: 700, fontSize: 15, color: '#1A1A24', margin: 0, lineHeight: 1.2 }}>{selected.nom}</h3>
                </div>
              </div>
              {selected.ville && (
                <p style={{ fontSize: 12, color: '#9090A8', marginBottom: 8 }}>📍 {selected.ville}</p>
              )}
              {cat && (
                <p style={{ fontSize: 12, color: '#9090A8', marginBottom: 12 }}>{cat.emoji} {cat.label.fr}</p>
              )}
              <Link href={`/entry/${selected.slug}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#C1001F', color: 'white', borderRadius: 12, padding: '10px 16px', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                Voir la fiche →
              </Link>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
