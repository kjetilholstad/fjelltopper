import { PeaksPageClient } from '@/components/peaks/PeaksPageClient'
import { createClient } from '@/lib/supabase/server'
import { getAscentCounts } from '@/lib/ascentCounts'

export const metadata = {
  title: 'Topper — Fjelltopper',
  description: 'Oversikt over norske fjelltopper.',
}

export default async function PeaksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  type AscentEntry = { id: string; peak_id: string; date: string; notes: string | null; weather: string | null }

  const [{ data: ascentsData }, countMap] = await Promise.all([
    user
      ? supabase.from('ascents').select('id, peak_id, date, notes, weather').eq('user_id', user.id)
      : Promise.resolve({ data: [] as AscentEntry[] }),
    getAscentCounts(),
  ])

  const ascendedMap: Record<string, { id: string; date: string; notes: string | null; weather: string | null }> = {}
  for (const a of (ascentsData ?? []) as AscentEntry[]) {
    ascendedMap[a.peak_id] = { id: a.id, date: a.date, notes: a.notes, weather: a.weather }
  }

  return (
    <PeaksPageClient
      ascendedMap={ascendedMap}
      userId={user?.id ?? null}
      countMap={countMap}
    />
  )
}
