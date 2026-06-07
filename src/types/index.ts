// src/types/index.ts

export type Discipline =
  | 'musique' | 'danse' | 'cinema' | 'graffiti'
  | 'theatre' | 'gastronomie' | 'edition'

export type Region =
  | 'Caraïbes' | 'Amérique du Nord' | 'Amérique du Sud'
  | 'Europe' | 'Afrique' | 'Asie' | 'Océanie'

export type Statut = 'en_cours' | 'archive' | 'en_projet' | 'fermé'

export type Lang = 'fr' | 'ht' | 'en'

// ── Entrée culturelle principale ──────────────────────────
export interface Entry {
  id:              number
  slug:            string
  nom:             string
  type:            string
  discipline:      Discipline
  sous_discipline: string
  annee:           string | null
  statut:          Statut
  ville:           string
  pays:            string
  region:          Region
  responsable:     string | null
  institution:     string | null
  studio:          string | null
  description:     string
  reference:       string | null
  tag:             string | null
  lien:            string | null
  rubrique:        string | null
  image_url:       string | null
  created_at:      string
  updated_at:      string
  // Relations enrichies
  related?:        Entry[]
  views?:          number
  featured?:       boolean
}

// ── Filtres de recherche ──────────────────────────────────
export interface SearchFilters {
  q?:           string
  discipline?:  Discipline | ''
  region?:      Region | ''
  statut?:      Statut | ''
  pays?:        string
  ville?:       string
  type?:        string
  sous_disc?:   string
  annee_from?:  string
  annee_to?:    string
  tag?:         string
  featured?:    boolean
  page?:        number
  limit?:       number
  sort?:        'nom' | 'annee' | 'created_at' | 'views'
  order?:       'asc' | 'desc'
}

// ── Résultat de recherche ─────────────────────────────────
export interface SearchResult {
  entries:    Entry[]
  total:      number
  page:       number
  totalPages: number
  facets:     Facets
}

export interface Facets {
  disciplines:   FacetItem[]
  regions:       FacetItem[]
  statuts:       FacetItem[]
  types:         FacetItem[]
  pays:          FacetItem[]
  sous_discs:    FacetItem[]
}

export interface FacetItem {
  value: string
  label: string
  count: number
}

// ── Stats globales ────────────────────────────────────────
export interface GlobalStats {
  total:           number
  by_discipline:   Record<Discipline, number>
  by_region:       Record<Region, number>
  by_statut:       Record<Statut, number>
  featured_count:  number
  countries:       number
}

// ── Navigation & UI ───────────────────────────────────────
export interface NavItem {
  label:      Record<Lang, string>
  href:       string
  discipline?: Discipline
  icon?:      string
}

export interface DisciplineConfig {
  id:       Discipline
  label:    Record<Lang, string>
  color:    string
  bgColor:  string
  icon:     string
  emoji:    string
  description: Record<Lang, string>
}

// ── Admin ─────────────────────────────────────────────────
export interface AdminUser {
  id:       string
  email:    string
  role:     'admin' | 'editor' | 'viewer'
  name:     string
}

export interface ImportJob {
  id:         string
  filename:   string
  status:     'pending' | 'running' | 'done' | 'error'
  total:      number
  processed:  number
  errors:     number
  created_at: string
}

// ── API responses ─────────────────────────────────────────
export interface ApiResponse<T> {
  data:    T
  error?:  string
  meta?:   Record<string, unknown>
}

export interface PaginatedResponse<T> {
  data:       T[]
  total:      number
  page:       number
  totalPages: number
  limit:      number
}
