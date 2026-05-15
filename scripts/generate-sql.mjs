/**
 * Generate supabase/seed_peaks.sql with ALTER TABLE + INSERT statements.
 * Run the output in Supabase Dashboard > SQL Editor.
 */
import { readFile, writeFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

function sql(v) {
  if (v === null || v === undefined) return 'NULL'
  if (typeof v === 'number') return String(v)
  return `'${String(v).replace(/'/g, "''")}'`
}

async function main() {
  const dataPath = join(__dirname, '..', 'data', 'peaks_full.json')
  const allPeaks = JSON.parse(await readFile(dataPath, 'utf-8'))
  const importable = allPeaks.filter(p => p.lat !== null && p.lng !== null)
  console.log(`Genererer SQL for ${importable.length} topper...`)

  const lines = []
  lines.push('-- Migration: add new columns to peaks table')
  lines.push('alter table public.peaks add column if not exists primary_factor integer;')
  lines.push('alter table public.peaks add column if not exists secondary_factor integer;')
  lines.push('alter table public.peaks add column if not exists parent_peak text;')
  lines.push('alter table public.peaks add column if not exists topo_map text;')
  lines.push('')
  lines.push('-- Delete all existing peaks')
  lines.push("delete from public.peaks where height > 0;")
  lines.push('')
  lines.push('-- Insert peaks')

  for (const p of importable) {
    lines.push(
      `insert into public.peaks (name, height, municipality, county, lat, lng, primary_factor, secondary_factor, parent_peak, topo_map, description, image_url) values (${sql(p.name)}, ${sql(p.height)}, ${sql(p.municipality || 'Ukjent')}, ${sql(p.county || 'Ukjent')}, ${sql(p.lat)}, ${sql(p.lng)}, ${sql(p.primary_factor)}, ${sql(p.secondary_factor)}, ${sql(p.parent_peak)}, ${sql(p.topo_map)}, ${sql(p.description)}, ${sql(p.image_url)});`
    )
  }

  const outPath = join(__dirname, '..', 'supabase', 'seed_peaks.sql')
  await writeFile(outPath, lines.join('\n'), 'utf-8')
  console.log(`Lagret til ${outPath}`)
  console.log(`Kjør denne filen i Supabase Dashboard > SQL Editor`)
}

main().catch(err => { console.error(err); process.exit(1) })
