/**
 * Geocode peaks with null lat/lng via Nominatim, 1 req/sec.
 * Saves progress to data/geocoded_peaks.json so the script can resume after a crash.
 * Tries to update Supabase directly; if RLS blocks it, generates SQL at the end.
 */
import { createClient } from '@supabase/supabase-js'
import { readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROGRESS_FILE = join(__dirname, '..', 'data', 'geocoded_peaks.json')
const SQL_FILE = join(__dirname, '..', 'supabase', 'update_coords.sql')

const SUPABASE_URL = 'https://enrbraxvxnytyfeuewqq.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVucmJyYXh2eG55dHlmZXVld3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4Njg2NzAsImV4cCI6MjA5NDQ0NDY3MH0.SW2D-4bm3KgcdNHNNbzLS6Hxt1cCi3hbCbnghvxReVA'

// Norway bounding box (mainland + Svalbard)
const LAT_MIN = 57.0, LAT_MAX = 81.5
const LNG_MIN = 3.0,  LNG_MAX = 32.0

function inNorway(lat, lng) {
  return lat >= LAT_MIN && lat <= LAT_MAX && lng >= LNG_MIN && lng <= LNG_MAX
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function nominatim(name, municipality, county) {
  // Try progressively broader queries until we get a hit
  const queries = [
    `${name}, ${municipality !== 'Ukjent' ? municipality + ', ' : ''}Norge`,
    `${name}, Norge`,
    `${name}, Norway`,
  ]

  for (const q of queries) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=3&accept-language=no`
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'fjelltopper-geocoder/1.0 (kjetil.holstad@gmail.com)' }
      })
      if (!res.ok) continue
      const results = await res.json()

      // Filter to results within Norway and with reasonable importance
      const valid = results.filter(r => {
        const lat = parseFloat(r.lat)
        const lng = parseFloat(r.lon)
        return inNorway(lat, lng) && parseFloat(r.importance) > 0.1
      })

      if (valid.length === 0) continue

      // Prefer natural/peak types, fall back to first valid result
      const best = valid.find(r => r.class === 'natural' || r.type === 'peak') ?? valid[0]
      const lat = Math.round(parseFloat(best.lat) * 1e6) / 1e6
      const lng = Math.round(parseFloat(best.lon) * 1e6) / 1e6
      const importance = parseFloat(best.importance)
      const type = `${best.class}/${best.type}`

      return { lat, lng, importance, type, query: q, display_name: best.display_name }
    } catch (e) {
      // Network error — skip this query variant
    }
  }
  return null
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  // Load existing progress
  let progress = {}
  if (existsSync(PROGRESS_FILE)) {
    try {
      progress = JSON.parse(await readFile(PROGRESS_FILE, 'utf-8'))
      console.log(`Lastet eksisterende fremgang: ${Object.keys(progress).length} peaks allerede behandlet`)
    } catch { progress = {} }
  }

  // Fetch all peaks with null lat
  console.log('Henter peaks uten koordinater fra Supabase...')
  const { data: peaks, error } = await supabase
    .from('peaks')
    .select('id, name, municipality, county')
    .is('lat', null)
    .order('name')

  if (error) { console.error('Feil:', error.message); process.exit(1) }
  console.log(`Fant ${peaks.length} peaks som mangler koordinater\n`)

  const todo = peaks.filter(p => !(p.id in progress))
  console.log(`Gjenstår: ${todo.length} (${peaks.length - todo.length} allerede gjort)\n`)

  // Check if Supabase updates work (RLS test)
  let canUpdate = false
  if (todo.length > 0) {
    const testPeak = todo[0]
    const { error: testErr } = await supabase
      .from('peaks')
      .update({ lat: null })
      .eq('id', testPeak.id)
    canUpdate = !testErr
    if (!canUpdate) console.log('OBS: RLS blokkerer oppdateringer — genererer SQL-fil i stedet\n')
    else console.log('Supabase-oppdateringer: aktivert\n')
  }

  let found = 0, notFound = 0, rlsFailed = 0
  const startTime = Date.now()

  for (let i = 0; i < todo.length; i++) {
    const peak = todo[i]
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
    const remaining = todo.length - i
    const eta = i > 0 ? Math.round((Date.now() - startTime) / i * remaining / 1000) : '?'
    process.stdout.write(`\r[${i + 1}/${todo.length}] ${elapsed}s inn, ~${eta}s igjen | Treff: ${found} | Ingen: ${notFound} | ${peak.name.slice(0, 30).padEnd(30)}`)

    const result = await nominatim(peak.name, peak.municipality, peak.county)

    if (result) {
      found++
      progress[peak.id] = {
        id: peak.id,
        name: peak.name,
        lat: result.lat,
        lng: result.lng,
        importance: result.importance,
        type: result.type,
        query: result.query,
        display_name: result.display_name,
        status: 'found',
      }

      // Try Supabase update
      if (canUpdate) {
        const { error: updErr } = await supabase
          .from('peaks')
          .update({ lat: result.lat, lng: result.lng })
          .eq('id', peak.id)
        if (updErr) { rlsFailed++; canUpdate = false }
      }
    } else {
      notFound++
      progress[peak.id] = { id: peak.id, name: peak.name, status: 'not_found' }
    }

    // Save progress every 10 peaks
    if ((i + 1) % 10 === 0 || i === todo.length - 1) {
      await writeFile(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf-8')
    }

    // Rate limit: 1 req/sec (Nominatim policy)
    await sleep(1050)
  }

  console.log(`\n\n=== Ferdig ===`)
  console.log(`Treff:         ${found}`)
  console.log(`Ikke funnet:   ${notFound}`)
  console.log(`Lagret til:    ${PROGRESS_FILE}`)

  // Generate SQL for all found coords (both new and previously found)
  const allFound = Object.values(progress).filter(p => p.status === 'found')
  if (allFound.length > 0) {
    const lines = [
      `-- Oppdater koordinater for ${allFound.length} peaks (generert av geocode-missing.mjs)`,
      '',
      ...allFound.map(p =>
        `update public.peaks set lat = ${p.lat}, lng = ${p.lng} where id = '${p.id}'; -- ${p.name}`
      )
    ]
    await writeFile(SQL_FILE, lines.join('\n'), 'utf-8')
    console.log(`SQL-oppdateringer: ${SQL_FILE}`)
  }

  // Final stats
  const totalWithCoords = Object.values(progress).filter(p => p.status === 'found').length
  console.log(`\nTotalt med koordinater etter kjøring: ${totalWithCoords}`)
  if (!canUpdate || rlsFailed > 0) {
    console.log(`\nKjør supabase/update_coords.sql i Supabase Dashboard > SQL Editor for å oppdatere databasen.`)
  }
}

main().catch(err => { console.error('\nKrasj:', err.message); process.exit(1) })
