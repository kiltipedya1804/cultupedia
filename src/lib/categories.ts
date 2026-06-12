// À ajouter / remplacer dans src/lib/config.ts

export interface CategoryDef {
  id: string
  label: { fr: string; ht: string; en: string }
  description: { fr: string; ht: string; en: string }
  emoji: string
  color: string
  family: string
}

export const CATEGORY_FAMILIES = [
  { id: 'patrimoine_vivant', label: { fr: 'Patrimoine vivant', ht: 'Eritaj vivan', en: 'Living Heritage' } },
  { id: 'savoirs_artisanat', label: { fr: 'Savoirs & Artisanat', ht: 'Konesans & Atizay', en: 'Knowledge & Crafts' } },
  { id: 'patrimoine_materiel', label: { fr: 'Patrimoine matériel', ht: 'Eritaj matèryèl', en: 'Material Heritage' } },
  { id: 'industries_savoir', label: { fr: 'Industries & Savoir', ht: 'Endistri & Konesans', en: 'Industries & Knowledge' } },
]

export const CATEGORIES: CategoryDef[] = [
  {
    id: 'patrimoine_oral',
    label: { fr: 'Patrimoine oral et littéraire', ht: 'Eritaj oral ak literè', en: 'Oral & Literary Heritage' },
    description: {
      fr: 'Contes, légendes, mythes, épopées, proverbes, devinettes, poésie orale, chants rituels, récits généalogiques, littérature orale',
      ht: 'Kont, lejand, mit, epope, pwovèb, devinèt, pwezi oral, chan rityèl, istwa fanmi, literati oral',
      en: 'Tales, legends, myths, epics, proverbs, riddles, oral poetry, ritual songs, genealogical narratives, oral literature',
    },
    emoji: '📜', color: '#8B5A2B', family: 'patrimoine_vivant',
  },
  {
    id: 'arts_spectacle',
    label: { fr: 'Arts du spectacle et expressions corporelles', ht: 'Atizay sèn ak ekspresyon kòporèl', en: 'Performing Arts & Body Expression' },
    description: {
      fr: 'Danse, musique, chant, théâtre, mime, acrobatie, jonglerie, arts du cirque, performance artistique',
      ht: 'Dans, mizik, chan, teyat, mim, akwobasi, jonglri, atizay sik, pèfòmans atistik',
      en: 'Dance, music, song, theatre, mime, acrobatics, juggling, circus arts, artistic performance',
    },
    emoji: '🎭', color: '#C1001F', family: 'patrimoine_vivant',
  },
  {
    id: 'gastronomie_savoirs',
    label: { fr: 'Gastronomie et savoirs culinaires', ht: 'Gastwonomi ak konesans kizin', en: 'Gastronomy & Culinary Knowledge' },
    description: {
      fr: 'Gastronomie traditionnelle, recettes patrimoniales, techniques de conservation, boissons traditionnelles, pratiques alimentaires rituelles, marchés alimentaires',
      ht: 'Gastwonomi tradisyonèl, rèsèt patrimonyal, teknik konsèvasyon, bwason tradisyonèl, pratik alimantè rityèl, mache manje',
      en: 'Traditional gastronomy, heritage recipes, preservation techniques, traditional beverages, ritual food practices, food markets',
    },
    emoji: '🍽️', color: '#D4A017', family: 'patrimoine_vivant',
  },
  {
    id: 'artisanat_arts_visuels',
    label: { fr: 'Artisanat et arts visuels', ht: 'Atizay ak atizay vizyèl', en: 'Crafts & Visual Arts' },
    description: {
      fr: "Artisanat d'art, sculpture, peinture, poterie, vannerie, tissage, broderie, bijouterie, lutherie, ferronnerie d'art, papier maché",
      ht: 'Atizay atistik, eskiltè, penti, kannari, panyen trese, tisaj, bwòdri, bijou, fè enstriman, fè fòje, papye maché',
      en: 'Art crafts, sculpture, painting, pottery, basketry, weaving, embroidery, jewelry, instrument-making, ironwork, papier-mâché',
    },
    emoji: '🎨', color: '#00235B', family: 'savoirs_artisanat',
  },
  {
    id: 'spiritualites_rituels',
    label: { fr: 'Spiritualités, rituels et médecine traditionnelle', ht: 'Espirityalite, rityèl ak medsin tradisyonèl', en: 'Spirituality, Rituals & Traditional Medicine' },
    description: {
      fr: 'Cérémonies religieuses, rituels de passage, fêtes religieuses, médecine traditionnelle, pharmacopée, pratiques divinatoires, cosmologies',
      ht: 'Seremoni relijye, rityèl pasaj, fèt relijye, medsin tradisyonèl, famasi natirèl, pratik divinasyon, kosmoloji',
      en: 'Religious ceremonies, rites of passage, religious festivals, traditional medicine, pharmacopoeia, divination practices, cosmologies',
    },
    emoji: '🕯️', color: '#6B2D5C', family: 'patrimoine_vivant',
  },
  {
    id: 'patrimoine_linguistique',
    label: { fr: 'Patrimoine linguistique', ht: 'Eritaj lengwistik', en: 'Linguistic Heritage' },
    description: {
      fr: "Langues, dialectes, argots, systèmes d'écriture, toponymie, anthroponymie, terminologies spécialisées",
      ht: 'Lang, dyalèk, jagon, sistèm ekriti, toponimi, antwoponimi, tèminoloji espesyalize',
      en: 'Languages, dialects, slang, writing systems, toponymy, anthroponymy, specialized terminology',
    },
    emoji: '🗣️', color: '#1E7A5C', family: 'patrimoine_vivant',
  },
  {
    id: 'jeux_sports',
    label: { fr: 'Jeux, sports et loisirs traditionnels', ht: 'Jwèt, espò ak divètisman tradisyonèl', en: 'Traditional Games, Sports & Leisure' },
    description: {
      fr: "Jeux populaires, sports traditionnels, jeux d'enfants, jeux de stratégie",
      ht: 'Jwèt popilè, espò tradisyonèl, jwèt timoun, jwèt estratejik',
      en: 'Popular games, traditional sports, children\'s games, strategy games',
    },
    emoji: '🎲', color: '#E07A1F', family: 'patrimoine_vivant',
  },
  {
    id: 'fetes_manifestations',
    label: { fr: 'Fêtes et manifestations culturelles', ht: 'Fèt ak manifestasyon kiltirèl', en: 'Festivals & Cultural Events' },
    description: {
      fr: 'Carnaval, festivals, fêtes patronales, célébrations saisonnières, rites agraires, cérémonies funéraires, mariages traditionnels',
      ht: 'Kanaval, festival, fèt patwonal, selebrasyon sezonye, rit agrè, seremoni finèb, maryaj tradisyonèl',
      en: 'Carnival, festivals, patronal feasts, seasonal celebrations, agrarian rites, funeral ceremonies, traditional weddings',
    },
    emoji: '🎉', color: '#C1001F', family: 'patrimoine_vivant',
  },
  {
    id: 'patrimoine_bati',
    label: { fr: 'Patrimoine bâti et paysager', ht: 'Eritaj bati ak peyizaj', en: 'Built & Landscape Heritage' },
    description: {
      fr: 'Architecture vernaculaire, sites sacrés, paysages culturels, jardins traditionnels, patrimoine urbain, sites archéologiques, grottes, paysages sacrés',
      ht: 'Achitekti lokal, sit sakre, peyizaj kiltirèl, jaden tradisyonèl, eritaj iben, sit akeyolojik, gwòt, peyizaj sakre',
      en: 'Vernacular architecture, sacred sites, cultural landscapes, traditional gardens, urban heritage, archaeological sites, caves, sacred landscapes',
    },
    emoji: '🏛️', color: '#5A5A6E', family: 'patrimoine_materiel',
  },
  {
    id: 'patrimoine_materiel',
    label: { fr: 'Patrimoine matériel et collections', ht: 'Eritaj matèryèl ak koleksyon', en: 'Material Heritage & Collections' },
    description: {
      fr: 'Manuscrits, objets rituels, instruments de musique, costumes traditionnels, monnaies, collections archéologiques, espèces végétales et animales à valeur culturelle',
      ht: 'Maniskri, objè rityèl, enstriman mizik, kostim tradisyonèl, lajan, koleksyon akeyolojik, espès plant ak bèt ak valè kiltirèl',
      en: 'Manuscripts, ritual objects, musical instruments, traditional costumes, coins, archaeological collections, culturally significant flora and fauna',
    },
    emoji: '🏺', color: '#8B5A2B', family: 'patrimoine_materiel',
  },
  {
    id: 'musees_galeries',
    label: { fr: 'Musées, galeries et patrimoine institutionnel', ht: 'Mize, galri ak eritaj enstitisyonèl', en: 'Museums, Galleries & Institutional Heritage' },
    description: {
      fr: "Musées nationaux, musées communautaires, galeries d'art, centres d'interprétation, collections privées, réserves muséales",
      ht: 'Mize nasyonal, mize kominotè, galri atizay, sant entèpretasyon, koleksyon prive, rezèv mize',
      en: 'National museums, community museums, art galleries, interpretation centers, private collections, museum reserves',
    },
    emoji: '🖼️', color: '#00235B', family: 'patrimoine_materiel',
  },
  {
    id: 'bibliotheques_archives',
    label: { fr: 'Bibliothèques, archives et documentation', ht: 'Bibliyotèk, achiv ak dokimantasyon', en: 'Libraries, Archives & Documentation' },
    description: {
      fr: 'Bibliothèques nationales, archives nationales, centres de documentation, médiathèques, bibliothèques communautaires, bibliothèques numériques, manuscrits numérisés',
      ht: 'Bibliyotèk nasyonal, achiv nasyonal, sant dokimantasyon, mediyatèk, bibliyotèk kominotè, bibliyotèk dijital, maniskri dijitalize',
      en: 'National libraries, national archives, documentation centers, media libraries, community libraries, digital libraries, digitized manuscripts',
    },
    emoji: '📚', color: '#1E7A5C', family: 'patrimoine_materiel',
  },
  {
    id: 'edition_presse',
    label: { fr: 'Édition, livre et presse culturelle', ht: 'Edisyon, liv ak laprès kiltirèl', en: 'Publishing, Books & Cultural Press' },
    description: {
      fr: "Maisons d'édition, librairies, imprimeries, distributeurs de livres, foires du livre, revues littéraires, presses universitaires, presse écrite culturelle",
      ht: 'Mezon edisyon, libreri, enprimri, distribitè liv, fwa liv, revi literè, près inivèsitè, près ekri kiltirèl',
      en: 'Publishing houses, bookstores, printers, book distributors, book fairs, literary journals, university presses, cultural print media',
    },
    emoji: '📖', color: '#6B2D5C', family: 'industries_savoir',
  },
  {
    id: 'medias_diffusion',
    label: { fr: 'Médias et diffusion culturelle', ht: 'Medya ak difizyon kiltirèl', en: 'Media & Cultural Broadcasting' },
    description: {
      fr: 'Radios culturelles, télévisions publiques, podcasts, webzines, plateformes de streaming locales',
      ht: 'Radyo kiltirèl, televizyon piblik, podkas, webzin, platfòm streaming lokal',
      en: 'Cultural radio, public television, podcasts, webzines, local streaming platforms',
    },
    emoji: '📡', color: '#E07A1F', family: 'industries_savoir',
  },
  {
    id: 'industries_creatives',
    label: { fr: 'Industries Culturelles et Créatives (ICC)', ht: 'Endistri Kiltirèl ak Kreyatif (IKK)', en: 'Cultural & Creative Industries' },
    description: {
      fr: 'Cinéma et audiovisuel, musique enregistrée, jeux vidéo, mode et design, publicité créative, architecture contemporaine, arts numériques',
      ht: 'Sinema ak odyovizyèl, mizik anrejistre, jwèt videyo, mòd ak desen, piblisite kreyatif, achitekti kontanporen, atizay dijital',
      en: 'Film & audiovisual, recorded music, video games, fashion & design, creative advertising, contemporary architecture, digital arts',
    },
    emoji: '🎬', color: '#C1001F', family: 'industries_savoir',
  },
  {
    id: 'formation_transmission',
    label: { fr: 'Formation et transmission culturelle', ht: 'Fòmasyon ak transmisyon kiltirèl', en: 'Cultural Education & Transmission' },
    description: {
      fr: "Écoles des beaux-arts, conservatoires, centres de formation artistique, apprentissage traditionnel, compagnonnage",
      ht: 'Lekòl boza, konsèvatwa, sant fòmasyon atistik, aprantisaj tradisyonèl, konpayonaj',
      en: 'Fine arts schools, conservatories, artistic training centers, traditional apprenticeship, mentorship',
    },
    emoji: '🎓', color: '#00235B', family: 'industries_savoir',
  },
  {
    id: 'infrastructures_culturelles',
    label: { fr: 'Infrastructures et espaces culturels', ht: 'Enfrastrikti ak espas kiltirèl', en: 'Cultural Infrastructure & Spaces' },
    description: {
      fr: "Théâtres, salles de concert, centres culturels, maisons de la culture, espaces de coworking créatif, résidences d'artistes",
      ht: 'Teyat, sal konsè, sant kiltirèl, kay kilti, espas kowòrking kreyatif, rezidans atis',
      en: 'Theatres, concert halls, cultural centers, houses of culture, creative coworking spaces, artist residencies',
    },
    emoji: '🏟️', color: '#5A5A6E', family: 'patrimoine_materiel',
  },
]

export const CATEGORY_MAP: Record<string, CategoryDef> = Object.fromEntries(
  CATEGORIES.map(c => [c.id, c])
)

export function getCategoriesByFamily(familyId: string): CategoryDef[] {
  return CATEGORIES.filter(c => c.family === familyId)
}
