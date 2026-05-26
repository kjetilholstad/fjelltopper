'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCollection } from '@/context/CollectionContext'

interface Stats {
  total: number
  pf30: number
  pf50: number
  pf100: number
}

export function HomeStatsClient() {
  const { activeCollection } = useCollection()
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!activeCollection) return
    let cancelled = false
    setError(false)
    const supabase = createClient()
    supabase
      .from('collection_peaks')
      .select('peaks(primary_factor)')
      .eq('collection_id', activeCollection.id)
      .then(({ data, error: err }) => {
        if (cancelled) return
        if (err) { setError(true); return }
        const peaks = (data ?? [])
          .map((row: any) => row.peaks)
          .filter(Boolean) as { primary_factor: number | null }[]
        const pf = (p: { primary_factor: number | null }) => p.primary_factor ?? 0
        setStats({
          total: peaks.length,
          pf30:  peaks.filter(p => pf(p) >= 30).length,
          pf50:  peaks.filter(p => pf(p) >= 50).length,
          pf100: peaks.filter(p => pf(p) >= 100).length,
        })
      })
    return () => { cancelled = true }
  }, [activeCollection?.id])

  const STAT_LABELS = ['Topper registrert', 'PF over 30 m', 'PF over 50 m', 'PF over 100 m']

  const items = stats
    ? [
        { value: stats.total.toLocaleString('no'),  label: STAT_LABELS[0] },
        { value: stats.pf30.toLocaleString('no'),   label: STAT_LABELS[1] },
        { value: stats.pf50.toLocaleString('no'),   label: STAT_LABELS[2] },
        { value: stats.pf100.toLocaleString('no'),  label: STAT_LABELS[3] },
      ]
    : Array(4).fill(null)

  return (
    <section className="bg-white" style={{ borderTop: '1px solid #E8E2D9' }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-4" style={{ borderColor: '#E8E2D9' }}>
          {items.map((item, i) => (
            <div
              key={i}
              className="py-6 px-4 text-center"
              style={i > 0 ? { borderLeft: '1px solid #E8E2D9' } : undefined}
            >
              {item ? (
                <>
                  <p className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">{item.value}</p>
                  <p className="text-xs mt-1" style={{ color: '#6B6560' }}>{item.label}</p>
                </>
              ) : error ? (
                <p className="text-xs" style={{ color: '#6B6560' }}>Statistikk utilgjengelig</p>
              ) : (
                <>
                  <div className="h-8 bg-[#F7F4EF] rounded animate-pulse mx-auto w-16 mb-1" />
                  <div className="h-3 bg-[#F7F4EF] rounded animate-pulse mx-auto w-20" />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
