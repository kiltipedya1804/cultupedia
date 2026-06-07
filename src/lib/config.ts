// src/lib/config.ts
import type { Discipline, DisciplineConfig, Lang } from '@/types'

export const DISCIPLINES: DisciplineConfig[] = [
  {
    id: 'musique',
    label: { fr: 'Musique', ht: 'Mizik', en: 'Music' },
    color: '#C1001F',
    bgColor: 'bg-brand-rouge/10',
    icon: '🎵',
    emoji: '🎵',
    description: {
      fr: 'Compas, rasin, rara, jazz créole, gospel, rap kreyòl et plus',
      ht: 'Konpa, rasin, rara, jaz kreyòl, levanjil, rap kreyòl ak plis',
      en: 'Compas, rasin, rara, Creole jazz, gospel, rap kreyòl and more',
    },
  },
  {
    id: 'danse',
    label: { fr: 'Danse', ht: 'Dans', en: 'Dance' },
    color: '#7C3AED',
    bgColor: 'bg-purple-500/10',
    icon: '💃',
    emoji: '💃',
    description: {
      fr: 'Danse traditionnelle, folklore, contemporaine, hip-hop haïtien',
      ht: 'Dans tradisyonèl, folklò, kontanporen, hip-hop ayisyen',
      en: 'Traditional dance, folklore, contemporary, Haitian hip-hop',
    },
  },
  {
    id: 'cinema',
    label: { fr: 'Cinéma', ht: 'Sinema', en: 'Cinema' },
    color: '#0369A1',
    bgColor: 'bg-sky-500/10',
    icon: '🎬',
    emoji: '🎬',
    description: {
      fr: 'Films, documentaires, réalisateurs, acteurs et festivals',
      ht: 'Film, dokimantè, realizatè, aktè ak festival',
      en: 'Films, documentaries, directors, actors and festivals',
    },
  },
  {
    id: 'graffiti',
    label: { fr: 'Arts Visuels', ht: 'Boza Vizyèl', en: 'Visual Arts' },
    color: '#D97706',
    bgColor: 'bg-amber-500/10',
    icon: '🎨',
    emoji: '🎨',
    description: {
      fr: 'Graffiti, peinture, sculpture, artisanat, galeries',
      ht: 'Grafiti, penti, eskilti, atizana, galri',
      en: 'Graffiti, painting, sculpture, crafts, galleries',
    },
  },
  {
    id: 'theatre',
    label: { fr: 'Théâtre', ht: 'Teyat', en: 'Theatre' },
    color: '#059669',
    bgColor: 'bg-emerald-500/10',
    icon: '🎭',
    emoji: '🎭',
    description: {
      fr: 'Théâtre classique, conte, contemporain, théâtre créole',
      ht: 'Teyat klasik, kont, kontanporen, teyat kreyòl',
      en: 'Classical theatre, storytelling, contemporary, Creole theatre',
    },
  },
  {
    id: 'gastronomie',
    label: { fr: 'Gastronomie', ht: 'Gastronomie', en: 'Gastronomy' },
    color: '#DC2626',
    bgColor: 'bg-red-500/10',
    icon: '🍽️',
    emoji: '🍽️',
    description: {
      fr: 'Cuisine créole, street food, pâtisserie, rhum haïtien',
      ht: 'Kwizin kreyòl, manje lari, patisri, wonm ayisyen',
      en: 'Creole cuisine, street food, pastry, Haitian rum',
    },
  },
  {
    id: 'edition',
    label: { fr: 'Édition', ht: 'Edisyon', en: 'Publishing' },
    color: '#4F46E5',
    bgColor: 'bg-indigo-500/10',
    icon: '📚',
    emoji: '📚',
    description: {
      fr: 'Livres, revues, journaux, bibliothèques, maisons d\'édition',
      ht: 'Liv, revi, jounal, bibliyotèk, kay edisyon',
      en: 'Books, reviews, newspapers, libraries, publishing houses',
    },
  },
]

export const DISCIPLINE_MAP = Object.fromEntries(
  DISCIPLINES.map(d => [d.id, d])
) as Record<Discipline, DisciplineConfig>

export function getDisciplineColor(disc: Discipline): string {
  return DISCIPLINE_MAP[disc]?.color ?? '#C1001F'
}

export function getDisciplineLabel(disc: Discipline, lang: Lang = 'fr'): string {
  return DISCIPLINE_MAP[disc]?.label[lang] ?? disc
}

export const TYPE_LABELS: Record<string, Record<Lang, string>> = {
  artiste_solo: { fr: 'Artiste solo', ht: 'Atis solo', en: 'Solo artist' },
  groupe:       { fr: 'Groupe', ht: 'Gwoup', en: 'Group' },
  orchestre:    { fr: 'Orchestre', ht: 'Òkès', en: 'Orchestra' },
  festival:     { fr: 'Festival', ht: 'Festival', en: 'Festival' },
  collectif:    { fr: 'Collectif', ht: 'Kolektif', en: 'Collective' },
  institution:  { fr: 'Institution', ht: 'Enstitisyon', en: 'Institution' },
  label:        { fr: 'Label', ht: 'Label', en: 'Label' },
  studio:       { fr: 'Studio', ht: 'Estidyo', en: 'Studio' },
  media:        { fr: 'Média', ht: 'Medya', en: 'Media' },
  mouvement:    { fr: 'Mouvement', ht: 'Mouvman', en: 'Movement' },
  lieu:         { fr: 'Lieu culturel', ht: 'Kote kiltirèl', en: 'Cultural venue' },
  organisation: { fr: 'Organisation', ht: 'Òganizasyon', en: 'Organisation' },
  producteur:   { fr: 'Producteur', ht: 'Pwodiktè', en: 'Producer' },
  ingenieur_son:{ fr: 'Ingénieur du son', ht: 'Enjenyè son', en: 'Sound engineer' },
  film:         { fr: 'Film', ht: 'Film', en: 'Film' },
  restaurant:   { fr: 'Restaurant', ht: 'Restoran', en: 'Restaurant' },
  galerie:      { fr: 'Galerie', ht: 'Galri', en: 'Gallery' },
  compagnie:    { fr: 'Compagnie', ht: 'Konpayi', en: 'Company' },
  critique:     { fr: 'Critique', ht: 'Kritik', en: 'Critic' },
  archives:     { fr: 'Archives', ht: 'Achiv', en: 'Archives' },
  plateforme:   { fr: 'Plateforme', ht: 'Platfòm', en: 'Platform' },
  bibliotheque: { fr: 'Bibliothèque', ht: 'Bibliyotèk', en: 'Library' },
  maison:       { fr: "Maison d'édition", ht: 'Kay edisyon', en: 'Publishing house' },
  auteur:       { fr: 'Auteur', ht: 'Otè', en: 'Author' },
  revue:        { fr: 'Revue', ht: 'Revi', en: 'Review' },
  club:         { fr: 'Club', ht: 'Klib', en: 'Club' },
  chorégraphe:  { fr: 'Chorégraphe', ht: 'Koreyograf', en: 'Choreographer' },
}

export function getTypeLabel(type: string, lang: Lang = 'fr'): string {
  return TYPE_LABELS[type]?.[lang] ?? type
}

export const STATUT_CONFIG = {
  en_cours:  { color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  archive:   { color: 'text-gray-500',    bg: 'bg-gray-50',    dot: 'bg-gray-400'    },
  en_projet: { color: 'text-blue-600',    bg: 'bg-blue-50',    dot: 'bg-blue-500'    },
  fermé:     { color: 'text-red-500',     bg: 'bg-red-50',     dot: 'bg-red-400'     },
}

export const REGIONS = [
  'Caraïbes', 'Amérique du Nord', 'Amérique du Sud',
  'Europe', 'Afrique', 'Asie', 'Océanie',
] as const

export const SORT_OPTIONS = [
  { value: 'created_at:desc', label: { fr: 'Plus récent', ht: 'Pi resan', en: 'Most recent' } },
  { value: 'nom:asc',         label: { fr: 'Nom A–Z',    ht: 'Non A–Z',  en: 'Name A–Z'    } },
  { value: 'nom:desc',        label: { fr: 'Nom Z–A',    ht: 'Non Z–A',  en: 'Name Z–A'    } },
  { value: 'views:desc',      label: { fr: 'Popularité', ht: 'Popilè',   en: 'Popularity'  } },
  { value: 'annee:asc',       label: { fr: 'Année ↑',   ht: 'Ane ↑',    en: 'Year ↑'      } },
  { value: 'annee:desc',      label: { fr: 'Année ↓',   ht: 'Ane ↓',    en: 'Year ↓'      } },
]

export const SITE_CONFIG = {
  name:        'Cultupedia',
  tagline:     { fr: 'Kiltipedya', ht: 'Kiltipedya', en: 'Cultupedia' },
  description: {
    fr: "L'encyclopédie vivante de la culture haïtienne",
    ht: "Ansiklopedi vivan kilti ayisyèn nan",
    en: "The living encyclopedia of Haitian culture",
  },
  url:         'https://cultupedia.ht',
  github:      'https://github.com/cultupedia',
  languages:   ['fr', 'ht', 'en'] as Lang[],
  defaultLang: 'fr' as Lang,
}
