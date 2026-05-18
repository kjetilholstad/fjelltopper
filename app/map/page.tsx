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
      ? supabase.from('ascents').select('peak_id, date').eq('user_id', user.id)
      : Promise.resolve({ data: [] as { peak_id: string; date: string }[] }),
  ])

  const peaks = (peaksData ?? []) as Peak[]
  const enriched = enrichPeaks(peaks)

  const ascendedMap: Record<string, string> = {}
  for (const a of (ascentsData ?? []) as { peak_id: string; date: string }[]) {
    ascendedMap[a.peak_id] = a.date
  }

  return (
    <MapWithFilters
      peaks={enriched}
      ascendedMap={ascendedMap}
      isLoggedIn={!!user}
      userId={user?.id ?? null}
    />
  )
}
