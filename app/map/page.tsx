import { createClient } from '@/lib/supabase/server'
import { enrichPeaks } from '@/lib/enrichPeaks'
import type { Peak } from '@/types'
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
  const enriched = enrichPeaks(peaks)

  return <MapWithFilters peaks={enriched} />
}
