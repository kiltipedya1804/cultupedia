# Cultupedia — Documentation de déploiement

## Stack technique

| Couche       | Technologie                         |
|-------------|--------------------------------------|
| Frontend    | Next.js 14 (App Router) + TypeScript |
| Styles      | TailwindCSS                          |
| Base de données | PostgreSQL (Supabase ou Neon)    |
| Déploiement | Vercel                               |
| Médias      | Cloudinary (optionnel)               |
| I18n        | next-intl (FR / HT / EN)             |

---

## 1. Prérequis

- Node.js ≥ 18
- Un compte [Supabase](https://supabase.com) (gratuit) ou [Neon](https://neon.tech)
- Un compte [Vercel](https://vercel.com)

---

## 2. Base de données PostgreSQL

### Option A — Supabase (recommandé)

1. Créer un projet sur supabase.com
2. Aller dans **SQL Editor**
3. Coller et exécuter le contenu de `docs/schema.sql`
4. Copier votre `DATABASE_URL` depuis **Settings > Database > Connection String > URI**

### Option B — Neon

1. Créer un projet sur neon.tech
2. Exécuter `docs/schema.sql` dans la console SQL
3. Copier la connection string

---

## 3. Installation locale

```bash
# Cloner le projet
git clone https://github.com/youruser/cultupedia.git
cd cultupedia

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.local.example .env.local
# Éditer .env.local avec vos clés

# Lancer le serveur de développement
npm run dev
# → http://localhost:3000
```

---

## 4. Import des données CSV

### Structure du dossier data/

```
cultupedia/
  data/
    cultupedia_musique.csv
    cultupedia_danse.csv
    cultupedia_cinema.csv
    cultupedia_graffiti.csv
    cultupedia_theatre.csv
    cultupedia_gastronomie.csv
    cultupedia_edition.csv
```

### Importer un fichier spécifique

```bash
node scripts/import-csv.js ./data/cultupedia_musique.csv
```

### Importer tous les fichiers du dossier data/

```bash
node scripts/import-csv.js
```

### Via l'interface admin

1. Aller sur `/admin`
2. Onglet **Importer CSV**
3. Glisser-déposer votre fichier
4. Cliquer **Démarrer l'import**

---

## 5. Déploiement sur Vercel

### 5.1 Via CLI

```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel --prod
```

### 5.2 Via GitHub (recommandé)

1. Pousser votre code sur GitHub
2. Sur [vercel.com](https://vercel.com), cliquer **New Project**
3. Importer votre repo GitHub
4. Configurer les variables d'environnement (voir section 6)
5. Cliquer **Deploy**

Vercel détecte automatiquement Next.js — aucune configuration supplémentaire.

---

## 6. Variables d'environnement Vercel

Dans **Settings > Environment Variables**, ajouter :

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | URL PostgreSQL (Supabase/Neon) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service Supabase |
| `ADMIN_API_KEY` | Clé secrète admin (générer aléatoirement) |
| `NEXT_PUBLIC_ADMIN_KEY` | Même valeur que ADMIN_API_KEY |
| `NEXT_PUBLIC_SITE_URL` | https://cultupedia.ht |

---

## 7. Structure du projet

```
cultupedia/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Page d'accueil
│   │   ├── layout.tsx                  # Layout racine
│   │   ├── globals.css                 # Styles globaux
│   │   ├── search/page.tsx             # Page recherche
│   │   ├── entry/[slug]/page.tsx       # Page profil entrée
│   │   ├── categories/[disc]/page.tsx  # Page catégorie
│   │   ├── admin/page.tsx              # Panneau admin
│   │   └── api/
│   │       ├── entries/route.ts        # GET/POST entrées
│   │       ├── entries/[slug]/route.ts # GET/PATCH/DELETE entrée
│   │       ├── import/route.ts         # Import CSV
│   │       └── stats/route.ts          # Stats globales
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx              # Navigation responsive
│   │   │   └── Footer.tsx              # Pied de page
│   │   ├── profile/
│   │   │   └── EntryCard.tsx           # Carte entrée
│   │   └── search/
│   │       └── SearchPage.tsx          # Page recherche complète
│   ├── lib/
│   │   ├── db.ts                       # Connexion + queries PostgreSQL
│   │   ├── config.ts                   # Disciplines, types, constantes
│   │   └── utils.ts                    # Helpers (cn, slugify...)
│   ├── i18n/
│   │   └── translations.ts             # FR / HT / EN
│   └── types/
│       └── index.ts                    # Types TypeScript
├── scripts/
│   └── import-csv.js                   # Import CSV en masse
├── docs/
│   └── schema.sql                      # Schéma PostgreSQL complet
├── public/                             # Assets statiques
├── .env.local.example                  # Variables d'environnement
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## 8. API REST

### GET /api/entries

Recherche et filtrage des entrées.

**Paramètres query :**

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Recherche full-text |
| `discipline` | string | musique, danse, cinema... |
| `region` | string | Caraïbes, Europe... |
| `statut` | string | en_cours, archive... |
| `pays` | string | Haïti, France... |
| `type` | string | artiste_solo, groupe... |
| `page` | number | Page (défaut: 1) |
| `limit` | number | Max 100 (défaut: 24) |
| `sort` | string | nom, views, created_at |
| `order` | string | asc, desc |

**Exemple :**
```
GET /api/entries?q=compas&discipline=musique&region=Caraïbes&limit=24
```

### GET /api/entries/:slug

Récupérer une entrée par slug.

### POST /api/entries

Créer une entrée (nécessite `x-api-key`).

### PATCH /api/entries/:slug

Modifier une entrée (nécessite `x-api-key`).

### DELETE /api/entries/:slug

Supprimer une entrée (nécessite `x-api-key`).

### POST /api/import

Importer un fichier CSV (multipart/form-data, nécessite `x-api-key`).

### GET /api/stats

Statistiques globales (total, par discipline, par région).

---

## 9. Multilingue (FR / HT / EN)

Le site supporte 3 langues. Pour ajouter une page en créole :

```
/fr  → Français (défaut)
/ht  → Kreyòl ayisyen
/en  → English
```

Les traductions sont dans `src/i18n/translations.ts`.

---

## 10. Performance et optimisations

- **ISR** (Incremental Static Regeneration) : pages catégories et stats revalidées toutes les heures
- **Full-text search** PostgreSQL avec index GIN sur `tsvector`
- **Index trigram** pour les recherches approximatives
- **Pagination** côté serveur (limit/offset)
- **Cache HTTP** sur les routes API (`s-maxage`, `stale-while-revalidate`)
- **Lazy loading** des composants avec `Suspense`
- **Images** optimisées via `next/image` + Cloudinary

---

## 11. Commandes utiles

```bash
npm run dev          # Développement local
npm run build        # Build production
npm run start        # Lancer le build
npm run lint         # Linter
node scripts/import-csv.js ./data/   # Import tous les CSV
```

---

## 12. Contacts et support

- **Site** : https://cultupedia.ht
- **Admin** : https://cultupedia.ht/admin
- **API** : https://cultupedia.ht/api/entries

---

*Cultupedia — Fait avec ♥ pour Haïti*
