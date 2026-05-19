import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PlannerShell } from '@/components/plan/PlannerShell'
import type { Peak } from '@/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Turplanlegger — Fjelltopper',
}

export default async function PlanPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('peaks')
    .select('id, name, height, lat, lng, primary_factor')
    .not('lat', 'is', null)
    .not('lng', 'is', null)

  const peaks = (data ?? []) as Peak[]
  return <PlannerShell peaks={peaks} />
}
