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
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: peaksData }, { data: ascentsData }] = await Promise.all([
    supabase
      .from('peaks')
      .select('*')
      .not('lat', 'is', null)
      .not('lng', 'is', null),
    user
      ? supabase.from('ascents').select('peak_id').eq('user_id', user.id)
      : Promise.resolve({ data: [] as { peak_id: string }[] }),
  ])

  const peaks = (peaksData ?? []) as Peak[]
  const enriched = enrichPeaks(peaks)
  const ascendedIds = (ascentsData ?? []).map(a => a.peak_id as string)

  return (
    <MapWithFilters
      peaks={enriched}
      ascendedIds={ascendedIds}
      isLoggedIn={!!user}
    />
  )
}
