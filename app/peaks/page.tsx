import { PeakList } from '@/components/peaks/PeakList'
import { createClient } from '@/lib/supabase/server'
import type { Peak, SubPeak, EnrichedPeak } from '@/types'

export const metadata = {
  title: 'Topper — Fjelltopper',
  description: 'Oversikt over norske fjelltopper.',
}

export default async function PeaksPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('peaks')
    .select('*')
    .order('height', { ascending: false })
  const peaks = (data ?? []) as Peak[]

  const peakMap = new Map(peaks.map(p => [p.id, p]))
  const enriched: EnrichedPeak[] = peaks.map(p => ({
    ...p,
    sub_peaks: (p.sub_peaks as string[] | null)
      ?.map(id => {
        const sp = peakMap.get(id)
        if (!sp) return null
        return {
          id: sp.id,
          name: sp.name,
          height: sp.height,
          pf: sp.primary_factor ?? 0,
          lat: sp.lat ?? undefined,
          lng: sp.lng ?? undefined,
        } as SubPeak
      })
      .filter((x): x is SubPeak => x !== null) ?? null,
  }))

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1A1A1A]">Norske fjelltopper</h1>
        <p className="text-text-warm mt-1 font-light">Søk, filtrer og sorter blant alle registrerte topper</p>
      </div>
      <PeakList peaks={enriched} />
    </div>
  )
}
