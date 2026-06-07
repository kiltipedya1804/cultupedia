-- ============================================================
-- CULTUPEDIA — Schéma PostgreSQL
-- Encyclopédie culturelle haïtienne
-- ============================================================

-- Extension pour UUID et recherche full-text
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ── Types ENUM ────────────────────────────────────────────
CREATE TYPE discipline_enum AS ENUM (
  'musique', 'danse', 'cinema', 'graffiti',
  'theatre', 'gastronomie', 'edition'
);

CREATE TYPE region_enum AS ENUM (
  'Caraïbes', 'Amérique du Nord', 'Amérique du Sud',
  'Europe', 'Afrique', 'Asie', 'Océanie'
);

CREATE TYPE statut_enum AS ENUM (
  'en_cours', 'archive', 'en_projet', 'fermé'
);

CREATE TYPE lang_enum AS ENUM ('fr', 'ht', 'en');

-- ── Table principale : entries ────────────────────────────
CREATE TABLE entries (
  id              SERIAL PRIMARY KEY,
  slug            TEXT NOT NULL UNIQUE,
  nom             TEXT NOT NULL,
  type            TEXT NOT NULL DEFAULT '',
  discipline      discipline_enum NOT NULL,
  sous_discipline TEXT NOT NULL DEFAULT '',
  annee           TEXT,
  statut          statut_enum NOT NULL DEFAULT 'en_cours',
  ville           TEXT NOT NULL DEFAULT '',
  pays            TEXT NOT NULL DEFAULT '',
  region          region_enum NOT NULL,
  responsable     TEXT,
  institution     TEXT,
  studio          TEXT,
  description     TEXT NOT NULL DEFAULT '',
  reference       TEXT,
  tag             TEXT,
  lien            TEXT,
  rubrique        TEXT,
  image_url       TEXT,
  featured        BOOLEAN NOT NULL DEFAULT FALSE,
  views           INTEGER NOT NULL DEFAULT 0,
  -- Recherche full-text
  search_vector   TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('french', unaccent(coalesce(nom, ''))), 'A') ||
    setweight(to_tsvector('french', unaccent(coalesce(description, ''))), 'B') ||
    setweight(to_tsvector('french', unaccent(coalesce(ville, '') || ' ' || coalesce(pays, ''))), 'C') ||
    setweight(to_tsvector('french', unaccent(coalesce(tag, '') || ' ' || coalesce(type, '') || ' ' || coalesce(sous_discipline, ''))), 'D')
  ) STORED,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Index de performance ──────────────────────────────────
CREATE INDEX idx_entries_discipline     ON entries(discipline);
CREATE INDEX idx_entries_region         ON entries(region);
CREATE INDEX idx_entries_statut         ON entries(statut);
CREATE INDEX idx_entries_pays           ON entries(pays);
CREATE INDEX idx_entries_ville          ON entries(ville);
CREATE INDEX idx_entries_type           ON entries(type);
CREATE INDEX idx_entries_sous_disc      ON entries(sous_discipline);
CREATE INDEX idx_entries_featured       ON entries(featured) WHERE featured = TRUE;
CREATE INDEX idx_entries_search         ON entries USING GIN(search_vector);
CREATE INDEX idx_entries_nom_trgm       ON entries USING GIN(nom gin_trgm_ops);
CREATE INDEX idx_entries_tag_trgm       ON entries USING GIN(tag gin_trgm_ops);
CREATE INDEX idx_entries_created_at     ON entries(created_at DESC);
CREATE INDEX idx_entries_views          ON entries(views DESC);

-- ── Traductions ───────────────────────────────────────────
CREATE TABLE entry_translations (
  id            SERIAL PRIMARY KEY,
  entry_id      INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  lang          lang_enum NOT NULL,
  nom           TEXT,
  description   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(entry_id, lang)
);

-- ── Relations entre entrées ───────────────────────────────
CREATE TABLE entry_relations (
  id            SERIAL PRIMARY KEY,
  entry_id      INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  related_id    INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL DEFAULT 'related', -- 'collaborator', 'influenced', 'member', 'related'
  UNIQUE(entry_id, related_id)
);

-- ── Médias ────────────────────────────────────────────────
CREATE TABLE entry_media (
  id            SERIAL PRIMARY KEY,
  entry_id      INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  type          TEXT NOT NULL, -- 'image', 'video', 'audio', 'document'
  url           TEXT NOT NULL,
  caption       TEXT,
  credit        TEXT,
  is_cover      BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Tags (table séparée pour facettes) ───────────────────
CREATE TABLE tags (
  id    SERIAL PRIMARY KEY,
  slug  TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE entry_tags (
  entry_id  INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  tag_id    INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY(entry_id, tag_id)
);

-- ── Statistiques d'import ────────────────────────────────
CREATE TABLE import_jobs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename    TEXT NOT NULL,
  discipline  discipline_enum,
  status      TEXT NOT NULL DEFAULT 'pending', -- pending, running, done, error
  total       INTEGER NOT NULL DEFAULT 0,
  processed   INTEGER NOT NULL DEFAULT 0,
  errors      INTEGER NOT NULL DEFAULT 0,
  error_log   JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

-- ── Admin users ───────────────────────────────────────────
CREATE TABLE admin_users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'editor', -- admin, editor, viewer
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Analytics ────────────────────────────────────────────
CREATE TABLE entry_views (
  id          SERIAL PRIMARY KEY,
  entry_id    INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  viewed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id  TEXT
);

-- ── Vue matérialisée : stats par discipline ──────────────
CREATE MATERIALIZED VIEW discipline_stats AS
SELECT
  discipline,
  COUNT(*)                          AS total,
  COUNT(*) FILTER (WHERE statut = 'en_cours')  AS en_cours,
  COUNT(*) FILTER (WHERE statut = 'archive')   AS archives,
  COUNT(DISTINCT pays)              AS countries,
  COUNT(DISTINCT region::TEXT)      AS regions_count,
  COUNT(*) FILTER (WHERE featured = TRUE) AS featured_count
FROM entries
GROUP BY discipline;

CREATE UNIQUE INDEX ON discipline_stats(discipline);

-- ── Fonctions utilitaires ─────────────────────────────────

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER entries_updated_at
  BEFORE UPDATE ON entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Générer un slug propre depuis un nom
CREATE OR REPLACE FUNCTION generate_slug(input TEXT)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
  counter INTEGER := 0;
  candidate TEXT;
BEGIN
  result := lower(unaccent(input));
  result := regexp_replace(result, '[^a-z0-9\s-]', '', 'g');
  result := regexp_replace(result, '\s+', '-', 'g');
  result := regexp_replace(result, '-+', '-', 'g');
  result := trim(both '-' from result);
  result := left(result, 80);
  
  candidate := result;
  LOOP
    IF NOT EXISTS (SELECT 1 FROM entries WHERE slug = candidate) THEN
      RETURN candidate;
    END IF;
    counter := counter + 1;
    candidate := result || '-' || counter;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Incrémenter le compteur de vues
CREATE OR REPLACE FUNCTION increment_views(entry_id_param INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE entries SET views = views + 1 WHERE id = entry_id_param;
  INSERT INTO entry_views(entry_id) VALUES (entry_id_param);
END;
$$ LANGUAGE plpgsql;

-- ── Recherche full-text avancée ──────────────────────────
CREATE OR REPLACE FUNCTION search_entries(
  p_query       TEXT DEFAULT NULL,
  p_discipline  TEXT DEFAULT NULL,
  p_region      TEXT DEFAULT NULL,
  p_statut      TEXT DEFAULT NULL,
  p_pays        TEXT DEFAULT NULL,
  p_type        TEXT DEFAULT NULL,
  p_sous_disc   TEXT DEFAULT NULL,
  p_featured    BOOLEAN DEFAULT NULL,
  p_limit       INTEGER DEFAULT 24,
  p_offset      INTEGER DEFAULT 0,
  p_sort        TEXT DEFAULT 'created_at',
  p_order       TEXT DEFAULT 'desc'
)
RETURNS TABLE(
  id INTEGER, slug TEXT, nom TEXT, type TEXT, discipline discipline_enum,
  sous_discipline TEXT, annee TEXT, statut statut_enum, ville TEXT, pays TEXT,
  region region_enum, description TEXT, tag TEXT, image_url TEXT,
  featured BOOLEAN, views INTEGER, created_at TIMESTAMPTZ,
  total_count BIGINT, rank REAL
) AS $$
DECLARE
  ts_query TSQUERY;
BEGIN
  IF p_query IS NOT NULL AND p_query != '' THEN
    ts_query := websearch_to_tsquery('french', unaccent(p_query));
  END IF;

  RETURN QUERY
  SELECT
    e.id, e.slug, e.nom, e.type, e.discipline,
    e.sous_discipline, e.annee, e.statut, e.ville, e.pays,
    e.region, e.description, e.tag, e.image_url,
    e.featured, e.views, e.created_at,
    COUNT(*) OVER() AS total_count,
    CASE WHEN ts_query IS NOT NULL
      THEN ts_rank(e.search_vector, ts_query)
      ELSE 0.0
    END AS rank
  FROM entries e
  WHERE
    (p_query IS NULL OR p_query = '' OR
      e.search_vector @@ ts_query OR
      e.nom ILIKE '%' || p_query || '%')
    AND (p_discipline IS NULL OR p_discipline = '' OR e.discipline::TEXT = p_discipline)
    AND (p_region IS NULL OR p_region = '' OR e.region::TEXT = p_region)
    AND (p_statut IS NULL OR p_statut = '' OR e.statut::TEXT = p_statut)
    AND (p_pays IS NULL OR p_pays = '' OR e.pays ILIKE '%' || p_pays || '%')
    AND (p_type IS NULL OR p_type = '' OR e.type ILIKE '%' || p_type || '%')
    AND (p_sous_disc IS NULL OR p_sous_disc = '' OR e.sous_discipline ILIKE '%' || p_sous_disc || '%')
    AND (p_featured IS NULL OR e.featured = p_featured)
  ORDER BY
    CASE WHEN ts_query IS NOT NULL THEN ts_rank(e.search_vector, ts_query) ELSE 0 END DESC,
    CASE WHEN p_sort = 'nom'        AND p_order = 'asc'  THEN e.nom END ASC,
    CASE WHEN p_sort = 'nom'        AND p_order = 'desc' THEN e.nom END DESC,
    CASE WHEN p_sort = 'views'      AND p_order = 'desc' THEN e.views END DESC,
    CASE WHEN p_sort = 'created_at' AND p_order = 'desc' THEN e.created_at END DESC,
    e.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ── Données exemples (10 entrées) ─────────────────────────
INSERT INTO entries (slug, nom, type, discipline, sous_discipline, annee, statut, ville, pays, region, responsable, institution, description, reference, tag, rubrique, featured) VALUES
('tabou-combo', 'Tabou Combo', 'groupe', 'musique', 'compas', '1968', 'en_cours', 'Pétion-Ville', 'Haïti', 'Caraïbes', 'Diogène Personna', NULL, 'Fondé en 1968 à Pétion-Ville, Tabou Combo est le groupe de compas le plus internationalement reconnu. Pionnier du compas moderne, il a joué dans plus de 50 pays et reste une référence absolue de la musique haïtienne dans la diaspora mondiale.', 'REF-MUS-000001', 'musique_compas', 'discographie', TRUE),
('boukman-eksperyans', 'Boukman Eksperyans', 'groupe', 'musique', 'rasin', '1978', 'en_cours', 'Port-au-Prince', 'Haïti', 'Caraïbes', 'Théodore Beaubrun Jr', NULL, 'Pionniers de la mizik rasin, Boukman Eksperyans fusionne les rythmes vodou ancestraux avec le rock et le reggae. Leur musique porte une dimension spirituelle et politique forte, incarnant la résistance culturelle haïtienne.', 'REF-MUS-000002', 'musique_rasin', 'discographie', TRUE),
('emeline-michel', 'Emeline Michel', 'artiste_solo', 'musique', 'chanson', '1980', 'en_cours', 'Gonaïves', 'Haïti', 'Caraïbes', NULL, NULL, 'Surnommée "la Reine de la chanson haïtienne", Emeline Michel est une artiste aux multiples facettes dont la voix traverse les frontières. Basée à New York depuis les années 90, elle incarne la fierté culturelle haïtienne à travers le monde.', 'REF-MUS-000003', 'musique_chanson', 'biographie', TRUE),
('carnaval-jacmel', 'Carnaval de Jacmel', 'festival', 'graffiti', 'artisanat', '1800', 'en_cours', 'Jacmel', 'Haïti', 'Caraïbes', NULL, 'Mairie de Jacmel', 'Le Carnaval de Jacmel est célèbre dans tout la Caraïbe pour ses masques en papier mâché artisanaux, héritage d''une tradition séculaire. Chaque année, artisans et artistes transforment la ville en galerie vivante de couleurs et de formes inspirées du cosmos haïtien.', 'REF-GRF-000001', 'graffiti_artisanat', 'expositions', TRUE),
('national-palace-cuisine', 'La Cuisine Créole du Palais', 'restaurant', 'gastronomie', 'cuisine créole', '1960', 'archive', 'Port-au-Prince', 'Haïti', 'Caraïbes', NULL, NULL, 'Représentant emblématique de la haute cuisine créole haïtienne, ce restaurant a servi pendant des décennies les plats fondateurs de la gastronomie nationale : griot, riz national, legim, tassot, et joumou — la soupe de l''indépendance.', 'REF-GAS-000001', 'gastronomie_cuisine_creole', 'menus', FALSE),
('theatre-quatre-chemins', 'Festival Quatre Chemins', 'festival', 'theatre', 'contemporain', '2004', 'en_cours', 'Port-au-Prince', 'Haïti', 'Caraïbes', 'Didier Dominique', NULL, 'Le Festival Quatre Chemins est la principale vitrine du théâtre contemporain haïtien et caribéen. En 20 ans d''existence, il a fait rayonner la scène dramaturgique haïtienne bien au-delà des frontières, accueillant des compagnies du monde entier.', 'REF-THE-000001', 'theatre_contemporain', 'représentations', TRUE),
('haiti-jazz-foundation', 'Haïti Jazz Foundation', 'institution', 'musique', 'jazz', '2002', 'en_cours', 'Port-au-Prince', 'Haïti', 'Caraïbes', NULL, NULL, 'La Haïti Jazz Foundation organise chaque année le Festival International de Jazz, devenu un rendez-vous incontournable de la musique caribéenne. Elle soutient également la formation de jeunes musiciens haïtiens et la préservation du jazz créole.', 'REF-MUS-000004', 'musique_jazz', 'activités', TRUE),
('fokal', 'FOKAL', 'institution', 'edition', 'bibliothèque', '1995', 'en_cours', 'Port-au-Prince', 'Haïti', 'Caraïbes', NULL, NULL, 'La Fondation Connaissance et Liberté (FOKAL) est le principal mécène culturel haïtien. Elle gère une bibliothèque de référence, soutient l''édition locale, organise des résidences d''artistes et finance des projets culturels dans tout le pays.', 'REF-EDI-000001', 'edition_bibliotheque', 'catalogue', TRUE),
('wyclef-jean', 'Wyclef Jean', 'artiste_solo', 'musique', 'hip-hop', '1990', 'en_cours', 'New York', 'États-Unis', 'Amérique du Nord', NULL, NULL, 'Co-fondateur des Fugees et artiste solo de renommée mondiale, Wyclef Jean est l''artiste haïtien le plus connu au niveau international. Sa musique fusionne hip-hop, compas, reggae et soul, et porte l''identité haïtienne sur les plus grandes scènes mondiales.', 'REF-MUS-000005', 'musique_hip-hop', 'biographie', TRUE),
('leogane-rara', 'Rara de Léogâne', 'collectif', 'musique', 'rara', '1800', 'en_cours', 'Léogâne', 'Haïti', 'Caraïbes', NULL, NULL, 'Le Rara de Léogâne est la plus grande et la plus ancienne manifestation rara du pays. Chaque année pendant le carême, des milliers de participants processionnent dans les rues de la ville avec des instruments traditionnels, incarnant une tradition vodou et musicale multicentenaire.', 'REF-MUS-000006', 'musique_rara', 'programmations', TRUE);

-- Refresh stats
REFRESH MATERIALIZED VIEW discipline_stats;
