import { createClient } from '@/lib/supabase/server'
import type { Peak, SubPeak, EnrichedPeak } from '@/types'
import { MapWithFilters } from '@/components/peaks/MapWithFilters'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Kart — Fjelltopper',
}

export default async function MapPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('peaks')
    .select('*')
    .not('lat', 'is', null)
    .not('lng', 'is', null)
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

  return <MapWithFilters peaks={enriched} />
}
