import { createClient } from '@supabase/supabase-js'
import { writeFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://enrbraxvxnytyfeuewqq.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVucmJyYXh2eG55dHlmZXVld3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4Njg2NzAsImV4cCI6MjA5NDQ0NDY3MH0.SW2D-4bm3KgcdNHNNbzLS6Hxt1cCi3hbCbnghvxReVA'

// --- HTML utils ---

function stripTags(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#160;/g, ' ').replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'").replace(/&#8722;/g, '-').replace(/&minus;/g, '-')
    .replace(/&ndash;/g, '–').replace(/&mdash;/g, '—')
}

function parseIntVal(str) {
  // Handles "2 469", "2.469", "2,469", "2 469"
  const clean = str.replace(/[\s., ]/g, '').replace(/[^0-9-]/g, '')
  const n = parseInt(clean, 10)
  return isNaN(n) ? null : n
}

// Extract all <td>/<th> cells from a row HTML, with colspan expansion
function parseCells(rowHtml, type = 'td') {
  const cells = []
  const re = new RegExp(`<${type}([^>]*)>([\\s\\S]*?)<\\/${type}>`, 'gi')
  let m
  while ((m = re.exec(rowHtml)) !== null) {
    const attrs = m[1]
    const html = m[2]
    const colspanM = attrs.match(/colspan=["\']?(\d+)/i)
    const rowspanM = attrs.match(/rowspan=["\']?(\d+)/i)
    const colspan = colspanM ? parseInt(colspanM[1], 10) : 1
    const rowspan = rowspanM ? parseInt(rowspanM[1], 10) : 1
    // Expand colspan inline (duplicate cell for each spanned column)
    for (let c = 0; c < colspan; c++) {
      cells.push({ html, rowspan, raw: m[0] })
    }
  }
  return cells
}

// Extract Wikipedia page title from href like //no.wikipedia.org/wiki/PageName
function extractWikiTitle(cellHtml) {
  const m = cellHtml.match(/href="(?:https?:)?\/\/no\.wikipedia\.org\/wiki\/([^"?]+)"/)
  if (!m) return null
  return decodeURIComponent(m[1].replace(/_/g, ' '))
}

// --- Parse all tables ---

function parseAllPeaks(html) {
  const peaks = []

  // Find all wikitables
  // Use a stack-based approach to handle potential nested tables
  let searchPos = 0
  const tableOpenRe = /<table([^>]*)>/gi
  const tableCloseRe = /<\/table>/gi

  // Build list of top-level wikitable ranges
  const tableRanges = []
  tableOpenRe.lastIndex = 0

  let openM
  while ((openM = tableOpenRe.exec(html)) !== null) {
    if (!openM[1].includes('wikitable')) continue
    const tableStart = openM.index
    // Find matching close tag by counting opens/closes
    let depth = 1
    let pos = tableOpenRe.lastIndex
    while (depth > 0 && pos < html.length) {
      const nextOpen = html.indexOf('<table', pos)
      const nextClose = html.indexOf('</table>', pos)
      if (nextClose < 0) break
      if (nextOpen >= 0 && nextOpen < nextClose) {
        depth++
        pos = nextOpen + 6
      } else {
        depth--
        if (depth === 0) {
          tableRanges.push({ start: tableStart, end: nextClose + 8 })
        }
        pos = nextClose + 8
      }
    }
  }

  console.log(`Fant ${tableRanges.length} wikitables`)

  for (const range of tableRanges) {
    const tableHtml = html.substring(range.start, range.end)

    // Check if this looks like a mountain list table (has Høyde column)
    if (!/høyde|moh\./i.test(tableHtml)) continue

    // Extract rows
    // Split by <tr to get row boundaries
    const rowSplit = tableHtml.split(/<tr[^>]*>/i)

    // Determine columns from header
    let colRank = -1, colName = -1, colHeight = -1, colPF = -1
    let colMun = -1, colCounty = -1, colTopo = -1, colRegion = -1
    let headerFound = false

    // Rowspan carry-over: array of {html, rowspan, remaining} indexed by col position
    let rowspanCarry = []

    for (let ri = 1; ri < rowSplit.length; ri++) {
      const rowHtml = rowSplit[ri]

      // Header row detection
      if (!headerFound && /<th/i.test(rowHtml)) {
        const thCells = parseCells(rowHtml, 'th')
        thCells.forEach((c, i) => {
          const t = decodeEntities(stripTags(c.html)).toLowerCase()
          if (/^nr\.?$|^#$|rang/.test(t)) colRank = i
          else if (/navn/.test(t)) colName = i
          else if (/høyde|moh/.test(t) && !/prim/.test(t)) colHeight = i
          else if (/prim[æa]r/.test(t)) colPF = i
          else if (/kommune/.test(t)) colMun = i
          else if (/fylke/.test(t)) colCounty = i
          else if (/kartblad/.test(t)) colTopo = i
          else if (/fjellomr/.test(t)) colRegion = i
        })
        // Assign defaults if some not found
        if (colRank < 0) colRank = 0
        if (colName < 0) colName = 1
        if (colHeight < 0) colHeight = 2
        if (colPF < 0) colPF = 3
        if (colMun < 0) colMun = 4
        if (colCounty < 0) colCounty = 5
        headerFound = true
        rowspanCarry = []
        continue
      }

      if (!headerFound) continue
      if (!/<td/i.test(rowHtml)) continue

      // Parse td cells
      const rawCells = parseCells(rowHtml, 'td')
      if (rawCells.length === 0) continue

      // Merge with rowspan carry-overs
      // Build full cell array including carried-over cells
      const fullCells = []
      let rawIdx = 0

      // Determine how many columns we need (max seen)
      const maxCol = Math.max(colRank, colName, colHeight, colPF, colMun, colCounty, colTopo, colRegion)

      for (let ci = 0; ci <= maxCol + 1; ci++) {
        if (rowspanCarry[ci] && rowspanCarry[ci].remaining > 0) {
          fullCells.push(rowspanCarry[ci].html)
          rowspanCarry[ci].remaining--
        } else if (rawIdx < rawCells.length) {
          const cell = rawCells[rawIdx++]
          fullCells.push(cell.html)
          if (cell.rowspan > 1) {
            rowspanCarry[ci] = { html: cell.html, remaining: cell.rowspan - 1 }
          } else {
            rowspanCarry[ci] = null
          }
        } else {
          fullCells.push('')
        }
      }

      const get = (idx) => (idx >= 0 && idx < fullCells.length) ? fullCells[idx] : ''

      // Extract fields
      const rankRaw = decodeEntities(stripTags(get(colRank))).trim()
      const rank = parseInt(rankRaw.replace(/\D/g, ''), 10) || null

      const nameCell = get(colName)
      const name = decodeEntities(stripTags(nameCell)).trim()
      if (!name || name.length < 2) continue

      const heightRaw = decodeEntities(stripTags(get(colHeight))).trim()
      const height = parseIntVal(heightRaw)
      if (!height || height < 100 || height > 9000) continue

      const pfRaw = decodeEntities(stripTags(get(colPF))).trim()
      const primary_factor = parseIntVal(pfRaw)

      const municipality = decodeEntities(stripTags(get(colMun))).trim() || null
      const county = decodeEntities(stripTags(get(colCounty))).trim() || null
      const topo_map = colTopo >= 0 ? (decodeEntities(stripTags(get(colTopo))).trim() || null) : null

      const wiki_title = extractWikiTitle(nameCell)

      peaks.push({
        rank,
        name,
        height,
        primary_factor: primary_factor ?? null,
        municipality,
        county,
        lat: null,
        lng: null,
        secondary_factor: null,
        parent_peak: null,
        topo_map,
        description: null,
        image_url: null,
        wiki_title,
      })
    }
  }

  return peaks
}

// --- Wikipedia API: batch fetch coordinates ---

async function fetchWikipediaCoords(titles) {
  if (titles.length === 0) return {}
  const params = new URLSearchParams({
    action: 'query',
    titles: titles.join('|'),
    prop: 'coordinates',
    format: 'json',
    formatversion: '2',
  })
  const url = `https://no.wikipedia.org/w/api.php?${params}`
  const res = await fetch(url, { headers: { 'User-Agent': 'fjelltopper/1.0' } })
  if (!res.ok) return {}
  const data = await res.json()
  const coords = {}
  for (const page of (data.query?.pages ?? [])) {
    if (page.coordinates?.[0]) {
      const { lat, lon } = page.coordinates[0]
      coords[page.title] = {
        lat: Math.round(lat * 1e6) / 1e6,
        lng: Math.round(lon * 1e6) / 1e6,
      }
    }
    // Handle redirects / normalized titles
    if (page.normalized) {
      const { from, to } = page.normalized
      if (coords[to]) coords[from] = coords[to]
    }
  }
  // Also handle normalizations at top level
  for (const norm of (data.query?.normalized ?? [])) {
    if (coords[norm.to]) coords[norm.from] = coords[norm.to]
  }
  // Handle redirects
  for (const redir of (data.query?.redirects ?? [])) {
    if (coords[redir.to]) coords[redir.from] = coords[redir.to]
  }
  return coords
}

// Nominatim geocoding for peaks without Wikipedia articles
async function nominatimGeocode(name, county) {
  await new Promise(r => setTimeout(r, 1100)) // rate limit: 1 req/sec
  const q = county ? `${name}, ${county}, Norge` : `${name}, Norge`
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&accept-language=no`
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'fjelltopper/1.0' } })
    if (!res.ok) return null
    const data = await res.json()
    if (!data.length) return null
    const { lat, lon } = data[0]
    return { lat: Math.round(parseFloat(lat) * 1e6) / 1e6, lng: Math.round(parseFloat(lon) * 1e6) / 1e6 }
  } catch {
    return null
  }
}

// --- Main ---

async function main() {
  // 1. Load from existing file or fetch+parse Wikipedia
  const outPath = join(__dirname, '..', 'data', 'peaks_full.json')
  let peaks
  let skipGeocode = false

  try {
    const { readFile } = await import('fs/promises')
    const existing = await readFile(outPath, 'utf-8')
    const parsed = JSON.parse(existing)
    if (parsed.length > 100) {
      peaks = parsed.map(p => ({ ...p, wiki_title: null })) // wiki_title stripped at save time
      skipGeocode = true
      console.log(`Lastet ${peaks.length} topper fra eksisterende peaks_full.json`)
    }
  } catch {}

  if (!peaks) {
    console.log('Fetcher Wikipedia-side...')
    const res = await fetch('https://no.wikipedia.org/wiki/Liste_over_Norges_h%C3%B8yeste_fjell', {
      headers: { 'User-Agent': 'fjelltopper/1.0' }
    })
    const html = await res.text()
    console.log(`HTML: ${(html.length / 1024).toFixed(0)} KB`)

    peaks = parseAllPeaks(html)
    console.log(`Parsede ${peaks.length} topper`)

    if (peaks.length < 10) {
      console.error('For få topper — avbryter')
      process.exit(1)
    }
  }

  // 2. Fetch coordinates from Wikipedia API in batches of 50
  const withWikiTitle = peaks.filter(p => p.wiki_title)
  const alreadyHaveCoords = peaks.filter(p => p.lat !== null).length
  if (skipGeocode && alreadyHaveCoords > 0) {
    console.log(`Hopper over geocoding — ${alreadyHaveCoords} topper har allerede koordinater`)
    // Jump straight to Supabase import
  }
  if (!skipGeocode) {
  console.log(`\nHenter koordinater fra Wikipedia API for ${withWikiTitle.length} topper...`)

  const BATCH = 50
  let coordMap = {}
  for (let i = 0; i < withWikiTitle.length; i += BATCH) {
    const batch = withWikiTitle.slice(i, i + BATCH)
    const titles = batch.map(p => p.wiki_title)
    const batchCoords = await fetchWikipediaCoords(titles)
    Object.assign(coordMap, batchCoords)
    process.stdout.write(`\r  ${Math.min(i + BATCH, withWikiTitle.length)}/${withWikiTitle.length} (${Object.keys(coordMap).length} med coords)`)
    await new Promise(r => setTimeout(r, 200)) // polite delay
  }
  console.log()

  // Apply Wikipedia coords to peaks
  for (const peak of peaks) {
    if (peak.wiki_title && coordMap[peak.wiki_title]) {
      peak.lat = coordMap[peak.wiki_title].lat
      peak.lng = coordMap[peak.wiki_title].lng
    }
  }

  const withCoords = peaks.filter(p => p.lat !== null).length
  const withoutCoords = peaks.filter(p => p.lat === null)
  console.log(`\nEtter Wikipedia API: ${withCoords} topper med koordinater`)
  console.log(`Mangler koordinater: ${withoutCoords.length}`)

  // 3. Nominatim fallback for peaks without coords (limit to 200 to avoid timeout)
  const nominatimTargets = withoutCoords.slice(0, 200)
  if (nominatimTargets.length > 0) {
    console.log(`\nNominatim geocoding for ${nominatimTargets.length} topper (1/sek)...`)
    let nominatimHits = 0
    for (let i = 0; i < nominatimTargets.length; i++) {
      const peak = nominatimTargets[i]
      const coords = await nominatimGeocode(peak.name, peak.county)
      if (coords) {
        peak.lat = coords.lat
        peak.lng = coords.lng
        nominatimHits++
      }
      process.stdout.write(`\r  ${i + 1}/${nominatimTargets.length} (${nominatimHits} treff)`)
    }
    console.log()
  }

  // 4. Save to JSON (all peaks, including those without coords)
  const outPath = join(__dirname, '..', 'data', 'peaks_full.json')
  // Remove wiki_title helper field before saving
  const peaksForSave = peaks.map(({ wiki_title, ...rest }) => rest)
  await writeFile(outPath, JSON.stringify(peaksForSave, null, 2), 'utf-8')
  console.log(`\nLagret ${peaks.length} topper til ${outPath}`)

  // 5. Update schema.sql with new columns
  const schemaPath = join(__dirname, '..', 'supabase', 'schema.sql')
  const { readFile } = await import('fs/promises')
  let schema = await readFile(schemaPath, 'utf-8')
  if (!schema.includes('primary_factor')) {
    schema = schema.replace(
      '  description text,\n  image_url text,',
      '  primary_factor integer,\n  secondary_factor integer,\n  parent_peak text,\n  topo_map text,\n  description text,\n  image_url text,'
    )
    await writeFile(schemaPath, schema, 'utf-8')
    console.log('Oppdaterte supabase/schema.sql med nye kolonner')
  }

  // 6. Supabase import
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  console.log('\nSletter eksisterende topper fra Supabase...')
  const { error: delErr } = await supabase.from('peaks').delete().gt('height', 0)
  if (delErr) {
    console.error('Slett-feil:', delErr.message)
    process.exit(1)
  }
  console.log('Sletting ferdig')

  // Only import peaks with coordinates (map requires them)
  const importable = peaks.filter(p => p.lat !== null && p.lng !== null)
  console.log(`Importerer ${importable.length} topper med koordinater...`)

  // First probe whether new columns exist by inserting a test row (dry run)
  const { error: probeErr } = await supabase.from('peaks').select('primary_factor').limit(1)
  const hasNewCols = !probeErr

  console.log(`Nye kolonner i DB: ${hasNewCols ? 'ja' : 'nei (kun basiskolonner importeres)'}`)
  if (!hasNewCols) {
    console.log(`\nKjør denne SQL-migrasjonen i Supabase Dashboard > SQL Editor:`)
    console.log(`\nalter table public.peaks add column if not exists primary_factor integer;`)
    console.log(`alter table public.peaks add column if not exists secondary_factor integer;`)
    console.log(`alter table public.peaks add column if not exists parent_peak text;`)
    console.log(`alter table public.peaks add column if not exists topo_map text;\n`)
  }

  const rows = importable.map(p => {
    const base = {
      name: p.name,
      height: p.height,
      municipality: p.municipality || 'Ukjent',
      county: p.county || 'Ukjent',
      lat: p.lat,
      lng: p.lng,
      description: p.description,
      image_url: p.image_url,
    }
    if (hasNewCols) {
      base.primary_factor = p.primary_factor
      base.secondary_factor = p.secondary_factor
      base.parent_peak = p.parent_peak
      base.topo_map = p.topo_map
    }
    return base
  })

  const INSERT_BATCH = 100
  let inserted = 0
  for (let i = 0; i < rows.length; i += INSERT_BATCH) {
    const batch = rows.slice(i, i + INSERT_BATCH)
    const { error: insErr } = await supabase.from('peaks').insert(batch)
    if (insErr) {
      console.error(`\nFeil ved batch ${i}: ${insErr.message}`)
    } else {
      inserted += batch.length
      process.stdout.write(`\r  ${inserted}/${rows.length}`)
    }
  }

  console.log(`\n\nFerdig!`)
  console.log(`  Totalt parsert: ${peaks.length}`)
  console.log(`  Med koordinater: ${peaks.filter(p => p.lat !== null).length}`)
  console.log(`  Importert til Supabase: ${inserted}`)
}

main().catch(err => {
  console.error('Uventet feil:', err)
  process.exit(1)
})
