'use client'

import { useEffect, useState } from 'react'
import { PlannerShell } from '@/components/plan/PlannerShell'
import { useCollection } from '@/context/CollectionContext'
import { createClient } from '@/lib/supabase/client'
import type { Peak } from '@/types'

export function PlanPageClient() {
  const { activeCollection } = useCollection()
  const [peaks, setPeaks] = useState<Peak[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeCollection) return
    setLoading(true)
    const supabase = createClient()
    supabase
      .from('collection_peaks')
      .select('peaks(id, name, height, lat, lng, primary_factor)')
      .eq('collection_id', activeCollection.id)
      .then(({ data }) => {
        const raw = (data ?? [])
          .map((row: any) => row.peaks)
          .filter((p: any): p is Peak => p != null && p.lat != null && p.lng != null)
        setPeaks(raw)
        setLoading(false)
      })
  }, [activeCollection?.id])

  if (loading || !activeCollection) {
    return <div className="max-w-3xl mx-auto px-4 py-8 text-text-warm">Laster…</div>
  }

  return <PlannerShell peaks={peaks} />
}
