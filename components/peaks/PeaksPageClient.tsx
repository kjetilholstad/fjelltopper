'use client'

import { useEffect, useState } from 'react'
import { PeakList } from '@/components/peaks/PeakList'
import { useCollection } from '@/context/CollectionContext'
import { createClient } from '@/lib/supabase/client'
import type { Peak } from '@/types'

interface Props {
  ascendedMap: Record<string, { id: string; date: string; notes: string | null; weather: string | null }>
  userId: string | null
  countMap: Record<string, number>
}

export function PeaksPageClient({ ascendedMap, userId, countMap }: Props) {
  const { activeCollection } = useCollection()
  const [peaks, setPeaks] = useState<Peak[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeCollection) return
    let cancelled = false
    setLoading(true)
    const supabase = createClient()
    supabase
      .from('collection_peaks')
      .select('peaks(*)')
      .eq('collection_id', activeCollection.id)
      .then(({ data }) => {
        if (cancelled) return
        const raw = (data ?? [])
          .map((row: any) => row.peaks)
          .filter(Boolean) as Peak[]
        raw.sort((a, b) => b.height - a.height)
        setPeaks(raw)
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [activeCollection?.id])

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-8 text-text-warm">Laster topper…</div>
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1A1A1A]">
          {activeCollection?.name ?? 'Norske fjelltopper'}
        </h1>
        <p className="text-text-warm mt-1 font-light">
          Søk, filtrer og sorter blant alle registrerte topper — standard filter: PF ≥ 30 m
        </p>
      </div>
      <PeakList peaks={peaks} ascendedMap={ascendedMap} userId={userId} countMap={countMap} />
    </div>
  )
}
