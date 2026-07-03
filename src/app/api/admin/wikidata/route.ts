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
      annee = dateClaim.time.substring(1, 5)
    }

    // Image via Wikimedia API (méthode correcte)
    let image_url = null
    const imageClaim = claims.P18?.[0]?.mainsnak?.datavalue?.value
    if (imageClaim) {
      try {
        const fileName = imageClaim.replace(/ /g, '_')
        const imgRes = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(fileName)}&prop=imageinfo&iiprop=url&format=json&origin=*`
        )
        const imgData = await imgRes.json()
        const pages = imgData.query?.pages ?? {}
        const page = Object.values(pages)[0] as any
        image_url = page?.imageinfo?.[0]?.url ?? null
      } catch {}
    }

    // Si pas d'image Wikidata, essayer Wikipedia
    if (!image_url) {
      const frTitle = entity.sitelinks?.frwiki?.title ?? entity.sitelinks?.enwiki?.title
      if (frTitle) {
        try {
          const wiki = frTitle ? 'fr' : 'en'
          const wpRes = await fetch(
            `https://${wiki}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(frTitle)}&prop=pageimages&pithumbsize=800&format=json&origin=*`
          )
          const wpData = await wpRes.json()
          const pages = wpData.query?.pages ?? {}
          const page = Object.values(pages)[0] as any
          image_url = page?.thumbnail?.source ?? null
        } catch {}
      }
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
    else if (paysClaim === 'Q781') pays = 'Jamaïque'
    else if (paysClaim === 'Q241') pays = 'Cuba'

    // Wikipedia URL
    let wikipedia_url = null
    const frSitelink = entity.sitelinks?.frwiki?.title
    if (frSitelink) {
      wikipedia_url = `https://fr.wikipedia.org/wiki/${encodeURIComponent(frSitelink)}`
    }

    // Description enrichie depuis Wikipedia si Wikidata trop courte
    let description_fr = descriptions.fr?.value ?? null
    const frTitle = entity.sitelinks?.frwiki?.title
    if (frTitle && (!description_fr || description_fr.length < 100)) {
      try {
        const extractRes = await fetch(
          `https://fr.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(frTitle)}&prop=extracts&exintro=true&explaintext=true&exsentences=5&format=json&origin=*`
        )
        const extractData = await extractRes.json()
        const pages = extractData.query?.pages ?? {}
        const page = Object.values(pages)[0] as any
        if (page?.extract && page.extract.length > 50) {
          description_fr = page.extract.slice(0, 800)
        }
      } catch {}
    }

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
