// src/i18n/translations.ts

export type Lang = 'fr' | 'ht' | 'en'

// Chaque section est un dictionnaire clé → valeur string
export type Section = Record<string, string>

// Les traductions par langue
export type Translations = Record<Lang, Record<string, Section>>

export const translations: Translations = {
  fr: {
    nav: {
      home: 'Accueil',
      musique: 'Musique',
      danse: 'Danse',
      cinema: 'Cinéma',
      graffiti: 'Arts Visuels',
      theatre: 'Théâtre',
      gastronomie: 'Gastronomie',
      edition: 'Édition',
      search: 'Rechercher',
      about: 'À propos',
      contact: 'Contact',
      admin: 'Admin',
    },
    home: {
      hero_title: 'La mémoire culturelle haïtienne',
      hero_subtitle: 'L\'encyclopédie vivante de la culture haïtienne — musique, danse, cinéma, arts visuels, théâtre, gastronomie et édition.',
      hero_cta: 'Explorer la base',
      hero_cta2: 'Rechercher',
      stats_entries: 'entrées culturelles',
      stats_disc: 'disciplines',
      stats_pays: 'pays couverts',
      stats_years: 'années d\'histoire',
      featured: 'À la une',
      recent: 'Dernières entrées',
      by_discipline: 'Par discipline',
      explore_all: 'Tout explorer',
    },
    // ... autres sections FR
  },

  ht: {
    nav: {
      home: 'Akèy',
      musique: 'Mizik',
      danse: 'Dans',
      cinema: 'Sinema',
      graffiti: 'Boza Vizyèl',
      theatre: 'Teyat',
      gastronomie: 'Gastronomie',
      edition: 'Edisyon',
      search: 'Chèche',
      about: 'Sou nou',
      contact: 'Kontakte nou',
      admin: 'Administrasyon',
    },
    home: {
      hero_title: 'Memwa kiltirèl ayisyen an',
      hero_subtitle: 'Ansiklopedi vivan kilti ayisyèn nan — mizik, dans, sinema, boza vizyèl, teyat, gastronomie ak edisyon.',
      hero_cta: 'Eksplore baz la',
      hero_cta2: 'Chèche',
      stats_entries: 'antre kiltirèl',
      stats_disc: 'disiplin',
      stats_pays: 'peyi kouvri',
      stats_years: 'ane istwa',
      featured: 'Pwentèt',
      recent: 'Dènye antre',
      by_discipline: 'Pa disiplin',
      explore_all: 'Eksplore tout',
    },
    // ... autres sections HT
  },

  en: {
    nav: {
      home: 'Home',
      musique: 'Music',
      danse: 'Dance',
      cinema: 'Cinema',
      graffiti: 'Visual Arts',
      theatre: 'Theatre',
      gastronomie: 'Gastronomy',
      edition: 'Publishing',
      search: 'Search',
      about: 'About',
      contact: 'Contact',
      admin: 'Admin',
    },
    home: {
      hero_title: 'Haitian cultural memory',
      hero_subtitle: 'The living encyclopedia of Haitian culture — music, dance, cinema, visual arts, theatre, gastronomy and publishing.',
      hero_cta: 'Explore the database',
      hero_cta2: 'Search',
      stats_entries: 'cultural entries',
      stats_disc: 'disciplines',
      stats_pays: 'countries covered',
      stats_years: 'years of history',
      featured: 'Featured',
      recent: 'Latest entries',
      by_discipline: 'By discipline',
      explore_all: 'Explore all',
    },
    // ... autres sections EN
  },
}

// Hook pour récupérer les traductions
export function useTranslations(lang: Lang): Record<string, Section> {
  return translations[lang] ?? translations['fr']
}

// Fonction utilitaire pour accéder à une clé
export function t(lang: Lang, key: string): string {
  const parts = key.split('.')
  let current: unknown = translations[lang]
  for (const part of parts) {
    if (typeof current !== 'object' || current === null) return key
    current = (current as Record<string, unknown>)[part]
  }
  return typeof current === 'string' ? current : key
}
