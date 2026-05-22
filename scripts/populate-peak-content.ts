/**
 * Populer description og image_url for fjelltopper via Claude Haiku + Wikimedia Commons.
 *
 * Bruk:
 *   npx tsx scripts/populate-peak-content.ts --dry-run   # preview uten skriving
 *   npx tsx scripts/populate-peak-content.ts              # skriv til Supabase
 *
 * Env-variabler fra .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   ANTHROPIC_API_KEY
 */

import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Load .env.local manually (tsx doesn't load it automatically) ──────────
function loadEnv() {
  const envPath = join(__dirname, '..', '.env.local')
  try {
    const lines = readFileSync(envPath, 'utf-8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
      if (!(key in process.env)) process.env[key] = val
    }
  } catch {
    console.warn('Kunne ikke lese .env.local — bruker eksisterende env-variabler')
  }
}

loadEnv()

const DRY_RUN = process.argv.includes('--dry-run')

const SUPABASE_URL        = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ANTHROPIC_API_KEY   = process.env.ANTHROPIC_API_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !ANTHROPIC_API_KEY) {
  console.error('Mangler env-variabler. Sjekk .env.local for:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

// ── Strip HTML tags from Wikimedia metadata ───────────────────────────────
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

// ── Generer beskrivelse via Claude Haiku ──────────────────────────────────
async function generateDescription(peak: {
  name: string
  height: number
  municipality: string
  county: string | null
  primary_factor: number | null
  nearest_higher_peak: string | null
}): Promise<string> {
  const nearestLine = peak.nearest_higher_peak
    ? `Nærmeste høyere topp er ${peak.nearest_higher_peak}.`
    : ''

  const prompt = `Skriv en kort, faktabasert beskrivelse av fjellet «${peak.name}» på norsk.
Fjellet er ${peak.height} meter over havet, ligger i ${peak.municipality} kommune i ${peak.county ?? 'Norge'}, og har en primærfaktor på ${peak.primary_factor ?? 0} meter.
${nearestLine}

Skriv 2–3 setninger. Vær konkret og geografisk. Ikke bruk klisjeer som «majestetisk» eller «vakkert». Ikke start med fjellets navn.
Svar kun med beskrivelsesteksten, ingen forklaring.`

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }],
  })

  const block = msg.content[0]
  if (block.type !== 'text') throw new Error('Uventet respons-type fra Claude')
  return block.text.trim()
}

// ── Hent bilde fra Wikimedia Commons ─────────────────────────────────────
const EXCLUDED_TERMS = ['map', 'logo', 'icon', 'coat', 'flag', 'emblem', 'crest', 'heraldry']

interface WikiImage {
  image_url: string
  image_credit: string
}

async function fetchWikimediaImage(peakName: string): Promise<WikiImage | null> {
  const url = new URL('https://commons.wikimedia.org/w/api.php')
  url.searchParams.set('action', 'query')
  url.searchParams.set('generator', 'search')
  url.searchParams.set('gsrnamespace', '6')
  url.searchParams.set('gsrsearch', `${peakName} norway mountain`)
  url.searchParams.set('gsrlimit', '8')
  url.searchParams.set('prop', 'imageinfo')
  url.searchParams.set('iiprop', 'url|extmetadata|mime')
  url.searchParams.set('iiurlwidth', '800')
  url.searchParams.set('format', 'json')
  url.searchParams.set('origin', '*')

  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'fjelltopper-content-bot/1.0 (kjetil.holstad@gmail.com)' },
  })
  if (!res.ok) return null

  const data = await res.json() as {
    query?: {
      pages?: Record<string, {
        imageinfo?: Array<{
          mime?: string
          thumburl?: string
          url?: string
          extmetadata?: {
            Artist?: { value: string }
            LicenseShortName?: { value: string }
          }
        }>
      }>
    }
  }

  const pages = Object.values(data.query?.pages ?? {})
  if (!pages.length) return null

  for (const page of pages) {
    const info = page.imageinfo?.[0]
    if (!info) continue

    const mime = info.mime ?? ''
    if (!mime.startsWith('image/jpeg') && !mime.startsWith('image/png')) continue

    const thumbUrl = info.thumburl ?? info.url ?? ''
    const urlLower = thumbUrl.toLowerCase()
    if (EXCLUDED_TERMS.some(t => urlLower.includes(t))) continue

    const artist      = info.extmetadata?.Artist?.value
    const license     = info.extmetadata?.LicenseShortName?.value
    const imageCredit = artist && license
      ? `${stripHtml(artist)} / ${license}`
      : (license ?? '')

    return { image_url: thumbUrl, image_credit: imageCredit }
  }

  return null
}

// ── Hoved-loop ────────────────────────────────────────────────────────────
async function main() {
  if (DRY_RUN) console.log('🔍 DRY-RUN modus — ingen skriving til Supabase\n')

  const { data: peaks, error } = await supabase
    .from('peaks')
    .select('id, name, height, municipality, county, primary_factor, nearest_higher_peak, description, image_url')
    .gte('height', 2000)
    .or('description.is.null,image_url.is.null')
    .order('height', { ascending: false })

  if (error) { console.error('Feil ved henting av topper:', error.message); process.exit(1) }
  if (!peaks?.length) { console.log('Ingen topper å behandle.'); return }

  const total = peaks.length
  console.log(`Behandler ${total} topper...\n`)

  let descCount = 0, imgCount = 0, errCount = 0

  for (let i = 0; i < total; i++) {
    const peak = peaks[i]
    let descOk = false, imgOk = false

    // ── Beskrivelse ──
    let description: string | null = peak.description
    if (!description) {
      try {
        description = await generateDescription(peak)
        descOk = true
        await sleep(500)
      } catch (e) {
        console.error(`  [feil] ${peak.name} — beskrivelse: ${(e as Error).message}`)
        errCount++
      }
    }

    // ── Bilde ──
    let image_url: string | null = peak.image_url
    let image_credit: string | null = null
    if (!peak.image_url) {
      try {
        const img = await fetchWikimediaImage(peak.name)
        if (img) {
          image_url = img.image_url
          image_credit = img.image_credit
          imgOk = true
        }
        await sleep(200)
      } catch (e) {
        console.error(`  [feil] ${peak.name} — bilde: ${(e as Error).message}`)
        errCount++
      }
    }

    if (descOk) descCount++
    if (imgOk) imgCount++

    const descMark = descOk ? '✓desc' : (peak.description ? '–desc' : '✗desc')
    const imgMark  = imgOk  ? '✓img'  : (peak.image_url  ? '–img'  : '✗img')
    console.log(`[${i + 1}/${total}] ${peak.name} — ${descMark} ${imgMark}`)

    if (DRY_RUN) {
      if (descOk) console.log(`  BESKRIVELSE: ${description}`)
      if (imgOk)  console.log(`  BILDE: ${image_url}`)
      if (imgOk)  console.log(`  CREDIT: ${image_credit}`)
      continue
    }

    // Bare skriv hvis minst én felt er oppdatert
    if (descOk || imgOk) {
      const update: Record<string, string | null> = {}
      if (descOk) update.description = description
      if (imgOk)  { update.image_url = image_url; update.image_credit = image_credit }

      const { error: updErr } = await supabase
        .from('peaks')
        .update(update)
        .eq('id', peak.id)

      if (updErr) {
        console.error(`  [feil] Supabase-oppdatering for ${peak.name}: ${updErr.message}`)
        errCount++
      }
    }
  }

  console.log(`\n=== Ferdig${DRY_RUN ? ' (dry-run)' : ''} ===`)
  console.log(`Beskrivelser: ${descCount}`)
  console.log(`Bilder:       ${imgCount}`)
  console.log(`Feil:         ${errCount}`)
}

main().catch(err => { console.error('\nKrasj:', err.message); process.exit(1) })
