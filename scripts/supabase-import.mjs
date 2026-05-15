/**
 * Import peaks from data/peaks_full.json into Supabase.
 * Handles both old schema (no extra cols) and new schema (with primary_factor etc).
 */
import { createClient } from '@supabase/supabase-js'
import { readFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://enrbraxvxnytyfeuewqq.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVucmJyYXh2eG55dHlmZXVld3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4Njg2NzAsImV4cCI6MjA5NDQ0NDY3MH0.SW2D-4bm3KgcdNHNNbzLS6Hxt1cCi3hbCbnghvxReVA'

async function main() {
  const dataPath = join(__dirname, '..', 'data', 'peaks_full.json')
  const allPeaks = JSON.parse(await readFile(dataPath, 'utf-8'))
  console.log(`Laster ${allPeaks.length} topper fra peaks_full.json`)

  const importable = allPeaks.filter(p => p.lat !== null && p.lng !== null)
  console.log(`${importable.length} har koordinater og kan importeres`)

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  // Probe which columns exist
  const { error: probeErr } = await supabase.from('peaks').select('primary_factor').limit(1)
  const hasNewCols = !probeErr
  console.log(`Nye kolonner i DB: ${hasNewCols ? 'ja' : 'nei'}`)

  if (!hasNewCols) {
    console.log(`\nOBS: Kjør denne SQL-migrasjonen i Supabase Dashboard > SQL Editor:`)
    console.log(`  alter table public.peaks add column if not exists primary_factor integer;`)
    console.log(`  alter table public.peaks add column if not exists secondary_factor integer;`)
    console.log(`  alter table public.peaks add column if not exists parent_peak text;`)
    console.log(`  alter table public.peaks add column if not exists topo_map text;`)
    console.log(`Importerer likevel med eksisterende kolonner...\n`)
  }

  // Delete all existing peaks
  console.log('Sletter eksisterende topper...')
  const { error: delErr } = await supabase.from('peaks').delete().gt('height', 0)
  if (delErr) { console.error('Slett-feil:', delErr.message); process.exit(1) }
  console.log('Slettet')

  const rows = importable.map(p => {
    const row = {
      name: p.name,
      height: p.height,
      municipality: p.municipality || 'Ukjent',
      county: p.county || 'Ukjent',
      lat: p.lat,
      lng: p.lng,
      description: p.description ?? null,
      image_url: p.image_url ?? null,
    }
    if (hasNewCols) {
      row.primary_factor = p.primary_factor ?? null
      row.secondary_factor = p.secondary_factor ?? null
      row.parent_peak = p.parent_peak ?? null
      row.topo_map = p.topo_map ?? null
    }
    return row
  })

  const BATCH = 100
  let inserted = 0
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const { error } = await supabase.from('peaks').insert(batch)
    if (error) {
      console.error(`\nFeil ved batch ${i}:`, error.message)
    } else {
      inserted += batch.length
      process.stdout.write(`\r  Importert: ${inserted}/${rows.length}`)
    }
  }

  console.log(`\n\nFerdig! Importerte ${inserted} topper til Supabase.`)
}

main().catch(err => { console.error(err); process.exit(1) })
