import { createClient } from '@/lib/supabase/server'
import { enrichPeaks } from '@/lib/enrichPeaks'
import { getAscentCounts } from '@/lib/ascentCounts'
import type { Peak } from '@/types'
import { MapWithFilters } from '@/components/peaks/MapWithFilters'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Kart — Fjelltopper',
}

export default async function MapPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  type AscentEntry = { id: string; peak_id: string; date: string; notes: string | null; weather: string | null }

  const [{ data: peaksData }, { data: ascentsData }, countMap] = await Promise.all([
    supabase
      .from('peaks')
      .select('*')
      .not('lat', 'is', null)
      .not('lng', 'is', null),
    user
      ? supabase.from('ascents').select('id, peak_id, date, notes, weather').eq('user_id', user.id)
      : Promise.resolve({ data: [] as AscentEntry[] }),
    getAscentCounts(),
  ])

  const peaks = (peaksData ?? []) as Peak[]
  const enriched = enrichPeaks(peaks)

  const ascendedMap: Record<string, { id: string; date: string; notes: string | null; weather: string | null }> = {}
  for (const a of (ascentsData ?? []) as AscentEntry[]) {
    ascendedMap[a.peak_id] = { id: a.id, date: a.date, notes: a.notes, weather: a.weather }
  }

  return (
    <MapWithFilters
      peaks={enriched}
      ascendedMap={ascendedMap}
      isLoggedIn={!!user}
      userId={user?.id ?? null}
      countMap={countMap}
    />
  )
}
