'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Mountain } from 'lucide-react'
import { useCollection } from '@/context/CollectionContext'
import { createClient } from '@/lib/supabase/client'
import { DeleteAscentButton } from '@/components/profile/DeleteAscentButton'
import { EditAscentButton } from '@/components/profile/EditAscentButton'
import { GpxUploader } from '@/components/peaks/GpxUploader'
import { AscentsByYearChart } from '@/components/profile/AscentsByYearChart'
import type { Peak } from '@/types'

interface AscentRow {
  id: string
  peak_id: string
  date: string
  notes: string | null
  weather: string | null
  peak: {
    id: string
    name: string
    height: number
    county: string | null
    municipality: string
    primary_factor: number | null
  }
}

interface Props {
  ascents: AscentRow[]
  userEmail: string
}

type CollectionPeak = Pick<Peak, 'id' | 'primary_factor'>

export function ProfileClient({ ascents, userEmail }: Props) {
  const { activeCollection } = useCollection()
  const [collectionPeaks, setCollectionPeaks] = useState<CollectionPeak[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeCollection) return
    setLoading(true)
    const supabase = createClient()
    supabase
      .from('collection_peaks')
      .select('peaks(id, primary_factor)')
      .eq('collection_id', activeCollection.id)
      .then(({ data }) => {
        const raw = (data ?? [])
          .map((row: any) => row.peaks)
          .filter(Boolean) as CollectionPeak[]
        setCollectionPeaks(raw)
        setLoading(false)
      })
  }, [activeCollection?.id])

  if (loading || !activeCollection) {
    return <div className="max-w-3xl mx-auto px-4 py-10 text-text-warm">Laster…</div>
  }

  const totalPeaks = collectionPeaks.length
  const totalPf30  = collectionPeaks.filter(p => (p.primary_factor ?? 0) >= 30).length
  const totalPf50  = collectionPeaks.filter(p => (p.primary_factor ?? 0) >= 50).length
  const totalPf100 = collectionPeaks.filter(p => (p.primary_factor ?? 0) >= 100).length

  const collectionPeakIds = new Set(collectionPeaks.map(p => p.id))
  const collectionAscents = ascents.filter(a => collectionPeakIds.has(a.peak_id))

  const totalCount  = collectionAscents.length
  const ascentPf30  = collectionAscents.filter(a => (a.peak.primary_factor ?? 0) >= 30).length
  const ascentPf50  = collectionAscents.filter(a => (a.peak.primary_factor ?? 0) >= 50).length
  const ascentPf100 = collectionAscents.filter(a => (a.peak.primary_factor ?? 0) >= 100).length

  const pct        = totalPeaks > 0 ? (totalCount / totalPeaks) * 100 : 0
  const maxHeight  = Math.max(...collectionAscents.map(a => a.peak.height), 0)
  const minHeight  = collectionAscents.length > 0 ? Math.min(...collectionAscents.map(a => a.peak.height)) : 0
  const totalHeight = collectionAscents.reduce((sum, a) => sum + a.peak.height, 0)
  const avgHeight  = totalCount > 0 ? Math.round(totalHeight / totalCount) : 0
  const counties   = new Set(collectionAscents.map(a => a.peak.county).filter(Boolean))
  const latestDate   = collectionAscents[0]?.date ?? null
  const earliestDate = collectionAscents[collectionAscents.length - 1]?.date ?? null

  const byYear = collectionAscents.reduce((acc, a) => {
    const year = a.date.slice(0, 4)
    if (!acc[year]) acc[year] = []
    acc[year].push(a)
    return acc
  }, {} as Record<string, AscentRow[]>)
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A1A1A]">Min profil</h1>
        <p className="text-sm text-text-warm mt-1">{userEmail}</p>
      </div>

      {/* Progress bars */}
      <div className="bg-white rounded-xl border border-border-warm shadow-sm p-5 mb-4">
        <span className="text-sm font-semibold text-[#1A1A1A]">Fremgang</span>
        <div className="flex flex-col gap-4 mt-3">
          {[
            { label: 'Topper registrert', ascended: totalCount,   total: totalPeaks,  color: '#2D5016', track: '#EAF3DE' },
            { label: 'PF over 30 m',      ascended: ascentPf30,   total: totalPf30,   color: '#0284C7', track: '#E0F2FE' },
            { label: 'PF over 50 m',      ascended: ascentPf50,   total: totalPf50,   color: '#E8671A', track: '#FFEDD5' },
            { label: 'PF over 100 m',     ascended: ascentPf100,  total: totalPf100,  color: '#D4A017', track: '#FEF3C7' },
          ].map(({ label, ascended, total, color, track }) => {
            const p = total > 0 ? (ascended / total) * 100 : 0
            return (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                    <span className="text-xs font-medium text-[#1A1A1A]">{label}</span>
                  </div>
                  <span className="text-xs font-semibold tabular-nums" style={{ color }}>
                    {ascended} / {total} · {p.toFixed(1).replace('.', ',')} %
                  </span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: track }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(p, 100)}%`, background: color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats grid */}
      <div className="bg-white rounded-xl border border-border-warm shadow-sm mb-8 overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-border-warm">
          {[
            { value: maxHeight > 0 ? `${maxHeight.toLocaleString('no')} moh` : '—', label: 'Høyeste topp' },
            { value: minHeight > 0 ? `${minHeight.toLocaleString('no')} moh` : '—', label: 'Laveste topp' },
            { value: avgHeight > 0 ? `${avgHeight.toLocaleString('no')} moh` : '—', label: 'Snitthøyde' },
          ].map(({ value, label }) => (
            <div key={label} className="py-5 px-4 text-center">
              <p className="text-xl font-bold text-[#1A1A1A]">{value}</p>
              <p className="text-xs text-text-warm mt-1">{label}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 divide-x divide-border-warm border-t border-border-warm">
          {[
            {
              value: totalHeight > 0 ? `${totalHeight.toLocaleString('no')} m` : '—',
              label: 'Summerte høydemeter',
            },
            { value: counties.size > 0 ? `${counties.size}` : '—', label: 'Fylker dekket' },
            {
              value: earliestDate
                ? new Date(earliestDate + 'T12:00:00').toLocaleDateString('no-NO', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                  })
                : '—',
              label: 'Første bestigning',
            },
          ].map(({ value, label }) => (
            <div key={label} className="py-5 px-4 text-center">
              <p className="text-xl font-bold text-[#1A1A1A]">{value}</p>
              <p className="text-xs text-text-warm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* GPX uploader */}
      <GpxUploader ascendedIds={ascents.map(a => a.peak_id)} />

      {/* Bestigninger per år */}
      {years.length > 0 && (
        <AscentsByYearChart
          byYear={Object.fromEntries(Object.entries(byYear).map(([y, arr]) => [y, arr.length]))}
        />
      )}

      {/* Ascent list */}
      {collectionAscents.length === 0 ? (
        <div className="text-center py-16">
          <Mountain size={40} className="text-border-warm mx-auto mb-3" strokeWidth={1.25} />
          <p className="text-text-warm mb-4">Du har ikke registrert noen bestigninger ennå.</p>
          <Link
            href="/peaks"
            className="inline-flex items-center gap-2 bg-forest text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Utforsk topper
          </Link>
        </div>
      ) : (
        <div>
          {years.map(year => (
            <div key={year} className="mt-10 first:mt-0">
              <h2 className="text-xs font-semibold text-text-warm uppercase tracking-wide mb-2 mt-6 first:mt-0">
                {year} · {byYear[year].length} bestigning{byYear[year].length !== 1 ? 'er' : ''}
              </h2>
              <div className="flex flex-col gap-2">
                {byYear[year].map(ascent => (
                  <div
                    key={ascent.id}
                    className="bg-white rounded-xl border border-border-warm p-4 flex items-start justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <Link
                          href={`/peaks/${ascent.peak.id}`}
                          className="font-semibold text-[#1A1A1A] hover:text-forest transition-colors"
                        >
                          {ascent.peak.name}
                        </Link>
                        <span className="text-sm text-text-warm">{ascent.peak.height.toLocaleString('no')} moh</span>
                      </div>

                      <p className="text-xs text-text-warm mt-0.5">
                        {new Date(ascent.date + 'T12:00:00').toLocaleDateString('no-NO', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })}
                        {ascent.weather && (
                          <span className="ml-2 text-text-warm">· {ascent.weather}</span>
                        )}
                      </p>

                      {ascent.notes && (
                        <p className="text-xs text-text-warm italic mt-1">{ascent.notes}</p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <EditAscentButton
                        ascentId={ascent.id}
                        peakId={ascent.peak_id}
                        peakName={ascent.peak.name}
                        currentDate={ascent.date}
                        currentNotes={ascent.notes}
                        currentWeather={ascent.weather}
                      />
                      <DeleteAscentButton peakId={ascent.peak_id} peakName={ascent.peak.name} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
