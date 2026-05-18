import { PeakList } from '@/components/peaks/PeakList'
import { createClient } from '@/lib/supabase/server'
import { enrichPeaks } from '@/lib/enrichPeaks'
import type { Peak } from '@/types'

export const metadata = {
  title: 'Topper — Fjelltopper',
  description: 'Oversikt over norske fjelltopper.',
}

export default async function PeaksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data }, { data: ascentsData }] = await Promise.all([
    supabase.from('peaks').select('*').order('height', { ascending: false }),
    user
      ? supabase.from('ascents').select('peak_id, date').eq('user_id', user.id)
      : Promise.resolve({ data: [] as { peak_id: string; date: string }[] }),
  ])

  const peaks = (data ?? []) as Peak[]
  const enriched = enrichPeaks(peaks)
  const ascendedMap: Record<string, string> = {}
  for (const a of (ascentsData ?? []) as { peak_id: string; date: string }[]) {
    ascendedMap[a.peak_id] = a.date
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1A1A1A]">Norske fjelltopper</h1>
        <p className="text-text-warm mt-1 font-light">Søk, filtrer og sorter blant alle registrerte topper</p>
      </div>
      <PeakList peaks={enriched} ascendedMap={ascendedMap} userId={user?.id ?? null} />
    </div>
  )
}
