// src/app/api/admin/wikidata/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const lang = searchParams.get('lang') ?? 'fr'

  if (!q) return NextResponse.json({ error: 'Requête manquante' }, { status: 400 })

  try {
    // 1. Recherche dans Wikidata
    const searchRes = await fetch(
      `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(q)}&language=${lang}&limit=5&format=json&origin=*`
    )
    const searchData = await searchRes.json()
    const results = searchData.search ?? []

    if (results.length === 0) {
      return NextResponse.json({ found: false, suggestions: [] })
    }

    // 2. Récupérer les détails du premier résultat
    const entityId = results[0].id
    const entityRes = await fetch(
      `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${entityId}&languages=fr|ht|en&format=json&origin=*&props=labels|descriptions|claims|sitelinks`
    )
    const entityData = await entityRes.json()
    const entity = entityData.entities?.[entityId]

    if (!entity) return NextResponse.json({ found: false })

    // 3. Extraire les données utiles
    const labels = entity.labels ?? {}
    const descriptions = entity.descriptions ?? {}
    const claims = entity.claims ?? {}

    // Coordonnées GPS (P625)
    let latitude = null, longitude = null
    const coordClaim = claims.P625?.[0]?.mainsnak?.datavalue?.value
    if (coordClaim) {
      latitude = coordClaim.latitude
      longitude = coordClaim.longitude
    }

    // Date de naissance/fondation (P569 ou P571)
    let annee = null
    const dateClaim = claims.P569?.[0]?.mainsnak?.datavalue?.value ??
                      claims.P571?.[0]?.mainsnak?.datavalue?.value
    if (dateClaim?.time) {
      annee = dateClaim.time.substring(1, 5) // Extraire l'année
    }

    // Image (P18)
    let image_url = null
    const imageClaim = claims.P18?.[0]?.mainsnak?.datavalue?.value
    if (imageClaim) {
      const fileName = imageClaim.replace(/ /g, '_')
      const hash = await md5Hash(fileName)
      image_url = `https://upload.wikimedia.org/wikipedia/commons/${hash[0]}/${hash[0]}${hash[1]}/${fileName}`
    }

    // Site officiel (P856)
    let lien = null
    const siteClaim = claims.P856?.[0]?.mainsnak?.datavalue?.value
    if (siteClaim) lien = siteClaim

    // Pays (P17)
    let pays = null
    const paysClaim = claims.P17?.[0]?.mainsnak?.datavalue?.value?.id
    if (paysClaim === 'Q790') pays = 'Haïti'
    else if (paysClaim === 'Q142') pays = 'France'
    else if (paysClaim === 'Q30') pays = 'États-Unis'

    // Wikipedia article FR
    let wikipedia_url = null
    const frSitelink = entity.sitelinks?.frwiki?.title
    if (frSitelink) {
      wikipedia_url = `https://fr.wikipedia.org/wiki/${encodeURIComponent(frSitelink)}`
    }

    // Description FR/HT/EN
    const description_fr = descriptions.fr?.value ?? null
    const description_en = descriptions.en?.value ?? null
    const nom_fr = labels.fr?.value ?? labels.en?.value ?? null

    return NextResponse.json({
      found: true,
      entity_id: entityId,
      wikidata_url: `https://www.wikidata.org/wiki/${entityId}`,
      wikipedia_url,
      suggestions: {
        nom: nom_fr,
        description: description_fr,
        description_en,
        image_url,
        lien,
        pays,
        latitude,
        longitude,
        annee,
      },
      other_results: results.slice(1, 4).map((r: any) => ({
        id: r.id,
        label: r.label,
        description: r.description,
      }))
    })
  } catch (error) {
    console.error('Wikidata error:', error)
    return NextResponse.json({ error: 'Erreur Wikidata' }, { status: 500 })
  }
}

// Simple MD5-like hash pour les URLs Wikimedia (premiers 2 chars du MD5 du nom de fichier)
async function md5Hash(str: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hashBuffer = await crypto.subtle.digest('MD5', data).catch(() => null)
  if (!hashBuffer) {
    // Fallback: utiliser un hash simple
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i)
      hash |= 0
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0')
    return hex.slice(0, 2)
  }
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 2)
}
