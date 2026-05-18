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
      ? supabase.from('ascents').select('peak_id').eq('user_id', user.id)
      : Promise.resolve({ data: [] as { peak_id: string }[] }),
  ])

  const peaks = (data ?? []) as Peak[]
  const enriched = enrichPeaks(peaks)
  const ascendedIds = (ascentsData ?? []).map(a => (a as { peak_id: string }).peak_id)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1A1A1A]">Norske fjelltopper</h1>
        <p className="text-text-warm mt-1 font-light">Søk, filtrer og sorter blant alle registrerte topper</p>
      </div>
      <PeakList peaks={enriched} ascendedIds={ascendedIds} />
    </div>
  )
}
