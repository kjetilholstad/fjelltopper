import { createClient } from '@/lib/supabase/server'

type RpcRow = { peak_id: string; ascent_count: number }

function toRecord(data: RpcRow[] | null): Record<string, number> {
  const result: Record<string, number> = {}
  for (const row of data ?? []) {
    result[row.peak_id] = Number(row.ascent_count)
  }
  return result
}

export async function getAscentCounts(): Promise<Record<string, number>> {
  const supabase = await createClient()
  const { data } = await supabase.rpc('get_peak_ascent_counts')
  return toRecord(data as RpcRow[] | null)
}

export async function getAscentCountsByYear(year: number): Promise<Record<string, number>> {
  const supabase = await createClient()
  const { data } = await supabase.rpc('get_peak_ascent_counts_by_year', { p_year: year })
  return toRecord(data as RpcRow[] | null)
}

export async function getAscentsByYear(): Promise<Record<string, number>> {
  const supabase = await createClient()
  const { data } = await supabase.from('ascents').select('date')
  const byYear: Record<string, number> = {}
  for (const row of data ?? []) {
    const year = (row.date as string).slice(0, 4)
    byYear[year] = (byYear[year] ?? 0) + 1
  }
  return byYear
}

export async function getAvailableAscentYears(): Promise<number[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('ascents').select('date')
  const yearsMap: Record<number, true> = {}
  for (const row of data ?? []) {
    yearsMap[parseInt((row.date as string).slice(0, 4), 10)] = true
  }
  return Object.keys(yearsMap).map(Number).sort((a, b) => b - a)
}

export async function getRawAscents(): Promise<{ peak_id: string; date: string }[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('ascents').select('peak_id, date')
  return (data ?? []) as { peak_id: string; date: string }[]
}

export async function getRawAscentsByYear(year: number): Promise<{ peak_id: string; date: string }[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('ascents')
    .select('peak_id, date')
    .gte('date', `${year}-01-01`)
    .lte('date', `${year}-12-31`)
  return (data ?? []) as { peak_id: string; date: string }[]
}
