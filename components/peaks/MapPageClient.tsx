'use client'

import { useEffect, useState } from 'react'
import { MapWithFilters } from '@/components/peaks/MapWithFilters'
import { useCollection } from '@/context/CollectionContext'
import { createClient } from '@/lib/supabase/client'
import { enrichPeaks } from '@/lib/enrichPeaks'
import type { Peak } from '@/types'

interface Props {
  isLoggedIn: boolean
  userId: string | null
  isAdmin: boolean
}

type AscentEntry = { id: string; peak_id: string; date: string; notes: string | null; weather: string | null }
type CountRow = { peak_id: string; ascent_count: number }

export function MapPageClient({ isLoggedIn, userId, isAdmin }: Props) {
  const { activeCollection } = useCollection()
  const [peaks, setPeaks] = useState<Peak[]>([])
  const [ascendedMap, setAscendedMap] = useState<Record<string, { id: string; date: string; notes: string | null; weather: string | null }>>({})
  const [countMap, setCountMap] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [fitToken, setFitToken] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!activeCollection) return
    let cancelled = false
    setLoading(true)
    setError(null)
    const supabase = createClient()

    Promise.all([
      supabase.from('collection_peaks').select('peaks(*)').eq('collection_id', activeCollection.id),
      userId
        ? supabase.from('ascents').select('id, peak_id, date, notes, weather').eq('user_id', userId)
        : Promise.resolve({ data: [] as AscentEntry[] }),
      supabase.rpc('get_peak_ascent_counts'),
    ]).then(([{ data: peaksData }, { data: ascentsData }, { data: rpcData }]) => {
      if (cancelled) return
      const raw = (peaksData ?? []).map((row: any) => row.peaks).filter(Boolean) as Peak[]
      setPeaks(enrichPeaks(raw))

      const map: Record<string, { id: string; date: string; notes: string | null; weather: string | null }> = {}
      for (const a of (ascentsData ?? []) as AscentEntry[]) {
        map[a.peak_id] = { id: a.id, date: a.date, notes: a.notes, weather: a.weather }
      }
      setAscendedMap(map)

      const counts: Record<string, number> = {}
      for (const row of (rpcData ?? []) as CountRow[]) {
        counts[row.peak_id] = Number(row.ascent_count)
      }
      setCountMap(counts)

      setFitToken(t => t + 1)
      setLoading(false)
    }).catch(() => {
      if (cancelled) return
      setError('Kunne ikke laste kartet.')
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [activeCollection?.id, userId])

  if (error) {
    return (
      <div style={{ height: 'calc(100vh - 64px)' }} className="flex items-center justify-center text-text-warm">
        {error}
      </div>
    )
  }

  if (loading || !activeCollection) {
    return <div style={{ height: 'calc(100vh - 64px)' }} className="bg-parchment animate-pulse" />
  }

  function handlePeakUpdated(updatedPeak: Peak) {
    setPeaks(prev => prev.map(p => p.id === updatedPeak.id ? updatedPeak : p))
  }

  return (
    <MapWithFilters
      peaks={peaks}
      ascendedMap={ascendedMap}
      isLoggedIn={isLoggedIn}
      userId={userId}
      countMap={countMap}
      fitToken={fitToken}
      isAdmin={isAdmin}
      onPeakUpdated={handlePeakUpdated}
    />
  )
}
