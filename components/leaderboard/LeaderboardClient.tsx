'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users } from 'lucide-react'
import { useCollection } from '@/context/CollectionContext'
import { createClient } from '@/lib/supabase/client'
import { YearSelect } from '@/components/leaderboard/YearSelect'
import { AscentsByYearChart } from '@/components/profile/AscentsByYearChart'
import type { Peak } from '@/types'

const RANK_COLORS: Record<number, string> = {
  1: '#D4A017',
  2: '#9CA3AF',
  3: '#CD7F32',
}

interface Props {
  countMap: Record<string, number>
  rawAscents: { peak_id: string; date: string }[]
  activeYear: number | null
}

type LeaderPeak = Pick<Peak, 'id' | 'name' | 'height' | 'county' | 'municipality'>

export function LeaderboardClient({ countMap, rawAscents, activeYear }: Props) {
  const { activeCollection } = useCollection()
  const [peaks, setPeaks] = useState<LeaderPeak[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeCollection) return
    let cancelled = false
    setLoading(true)
    const supabase = createClient()
    supabase
      .from('collection_peaks')
      .select('peaks(id, name, height, county, municipality)')
      .eq('collection_id', activeCollection.id)
      .then(({ data }) => {
        if (cancelled) return
        const raw = (data ?? [])
          .map((row: any) => row.peaks)
          .filter(Boolean) as LeaderPeak[]
        setPeaks(raw)
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [activeCollection?.id])

  if (loading || !activeCollection) {
    return <div className="max-w-3xl mx-auto px-4 py-8 text-text-warm">Laster…</div>
  }

  const collectionPeakIds = new Set(peaks.map(p => p.id))

  const filteredRaw = rawAscents.filter(a => collectionPeakIds.has(a.peak_id))

  const ascentsByYear: Record<string, number> = {}
  for (const row of filteredRaw) {
    const year = row.date.slice(0, 4)
    ascentsByYear[year] = (ascentsByYear[year] ?? 0) + 1
  }
  const availableYears = Object.keys(ascentsByYear)
    .map(Number)
    .sort((a, b) => b - a)

  const filtered = Object.fromEntries(
    Object.entries(countMap).filter(([id]) => collectionPeakIds.has(id))
  )

  const ranked = peaks
    .map(p => ({ ...p, count: filtered[p.id] ?? 0 }))
    .filter(p => p.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 50)

  const total = Object.values(filtered).reduce((s, n) => s + n, 0)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1A1A1A]">Mest besteget</h1>
        <p className="text-text-warm mt-1 font-light">
          {total.toLocaleString('no')} bestigninger registrert totalt
          {activeYear ? ` i ${activeYear}` : ''}
        </p>
      </div>

      <YearSelect years={availableYears} activeYear={activeYear} />

      {Object.keys(ascentsByYear).length > 0 && (
        <AscentsByYearChart byYear={ascentsByYear} />
      )}


      {ranked.length === 0 ? (
        <p className="text-center text-text-warm py-16">
          Ingen bestigninger registrert{activeYear ? ` for ${activeYear}` : ''}.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {ranked.map((peak, i) => {
            const rank = i + 1
            const rankColor = RANK_COLORS[rank]
            return (
              <div
                key={peak.id}
                className="bg-white rounded-xl border border-border-warm shadow-sm px-4 py-3 flex items-center gap-4"
              >
                <span
                  className="text-sm font-bold w-6 shrink-0 text-center"
                  style={{ color: rankColor ?? '#A89F96' }}
                >
                  {rank}
                </span>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/peaks/${peak.id}`}
                    className="font-semibold text-[#1A1A1A] hover:text-forest transition-colors text-sm"
                  >
                    {peak.name}
                  </Link>
                  <p className="text-xs text-text-warm">
                    {peak.height.toLocaleString('no')} moh
                    {peak.county ? ` · ${peak.county}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Users size={13} className="text-text-warm" strokeWidth={1.75} />
                  <span className="text-sm font-semibold text-[#1A1A1A]">
                    {peak.count.toLocaleString('no')}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
