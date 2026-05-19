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
