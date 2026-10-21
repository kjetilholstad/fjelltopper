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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!activeCollection) return
    let cancelled = false
    setLoading(true)
    setError(null)
    const supabase = createClient()
    supabase
      .from('collection_peaks')
      .select('peaks(id, name, height, lat, lng, primary_factor)')
      .eq('collection_id', activeCollection.id)
      .then(({ data, error: err }) => {
        if (cancelled) return
        if (err) { setError('Kunne ikke laste topper.'); setLoading(false); return }
        const raw = (data ?? [])
          .map((row: any) => row.peaks)
          .filter((p: any): p is Peak => p != null && p.lat != null && p.lng != null)
        setPeaks(raw)
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [activeCollection?.id])

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-text-warm">
        {error}
      </div>
    )
  }

  if (loading || !activeCollection) {
    return <div className="max-w-3xl mx-auto px-4 py-8 text-text-warm">Laster…</div>
  }

  return <PlannerShell peaks={peaks} />
}
