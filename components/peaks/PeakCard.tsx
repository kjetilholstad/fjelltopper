'use client'

import { useState, useMemo, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { Mountain, TrendingUp, Navigation, ArrowUpToLine, MapPin, CheckCircle2, ChevronRight, ChevronDown, ChevronUp, ExternalLink, Users } from 'lucide-react'
import type { EnrichedPeak } from '@/types'
import { nearestPeak, haversineKm } from '@/lib/nearestPeaks'
import { createClient } from '@/lib/supabase/client'
import { getNearbyPeaks } from '@/lib/nearbyPeaks'
import { logAscent, deleteAscent } from '@/app/ascents/actions'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EditAscentButton } from '@/components/profile/EditAscentButton'
import { formatDist } from '@/lib/utils'
import { useCollection } from '@/context/CollectionContext'

interface PeakCardProps {
  peak: EnrichedPeak
  rank?: number
  isAscended?: boolean
  ascentId?: string | null
  ascentDate?: string | null
  ascentNotes?: string | null
  ascentWeather?: string | null
  userId?: string | null
  allPeaks?: EnrichedPeak[]
  ascentCount?: number
}

export function PeakCard({ peak, rank, isAscended = false, ascentId = null, ascentDate = null, ascentNotes = null, ascentWeather = null, userId = null, allPeaks, ascentCount }: PeakCardProps) {
  const [open, setOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { activeCollection } = useCollection()
  const nearestHigherLabel = activeCollection?.nearestHigherLabel ?? 'Nærmeste over 2000 m (PF ≥ 30 m)'

  const [higherPeak, setHigherPeak] = useState<EnrichedPeak | null>(null)
  useEffect(() => {
    if (!peak.nearest_higher_peak_id) { setHigherPeak(null); return }
    const found = allPeaks?.find(p => p.id === peak.nearest_higher_peak_id)
    if (found) { setHigherPeak(found); return }
    let cancelled = false
    const supabase = createClient()
    supabase
      .from('peaks')
      .select('*')
      .eq('id', peak.nearest_higher_peak_id)
      .single()
      .then(({ data }) => { if (!cancelled) setHigherPeak((data as EnrichedPeak) ?? null) })
    return () => { cancelled = true }
  }, [peak.nearest_higher_peak_id, allPeaks])

  const nearbyPeaks = useMemo(() => getNearbyPeaks(peak, allPeaks ?? []), [peak, allPeaks])

  const nearest = useMemo(() => {
    if (!allPeaks) return null
    return nearestPeak(peak, allPeaks, activeCollection?.nearestHigherMinHeight ?? 0)
  }, [peak, allPeaks, activeCollection?.nearestHigherMinHeight])

  return (
    <div className="group block">
      <div className="bg-white rounded-xl border border-border-warm p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 h-full relative">
        <Link
          href={`/peaks/${peak.id}`}
          className="absolute inset-0 rounded-xl z-0"
          aria-label={`Vis detaljer for ${peak.name}`}
        />

        {/* Rank badge */}
        {rank != null && (
          <span className="absolute top-3 right-3 z-10 text-[11px] font-semibold text-text-warm bg-parchment border border-border-warm rounded-full px-2 py-0.5">
            #{rank}
          </span>
        )}

        {/* Name */}
        <div className="flex items-start gap-2 mb-3 pr-8">
          <Mountain size={16} className="text-forest mt-0.5 shrink-0" strokeWidth={1.75} />
          <span className="font-bold text-[#1A1A1A] text-sm leading-tight">{peak.name}</span>
        </div>

        {/* Height + ascent badge */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-forest shrink-0" strokeWidth={1.75} />
            <span className="text-lg font-bold text-[#1A1A1A]">{peak.height.toLocaleString('no')}</span>
            <span className="text-xs text-text-warm font-light">moh</span>
          </div>

          {userId !== null && isAscended && ascentDate ? (
            <div className="relative z-10 flex items-center gap-1">
              {ascentId && (
                <EditAscentButton
                  ascentId={ascentId}
                  peakId={peak.id}
                  peakName={peak.name}
                  currentDate={ascentDate}
                  currentNotes={ascentNotes}
                  currentWeather={ascentWeather}
                />
              )}
              <button
                disabled={isPending}
                onClick={e => { e.stopPropagation(); setConfirmOpen(true) }}
                title="Fjern bestigning"
                className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-forest-50 text-forest border border-forest/20 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-50"
              >
                <CheckCircle2 size={11} strokeWidth={2} />
                {new Date(ascentDate + 'T12:00:00').toLocaleDateString('no-NO', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </button>
              <ConfirmDialog
                open={confirmOpen}
                onConfirm={() => {
                  const fd = new FormData()
                  fd.append('peak_id', peak.id)
                  startTransition(async () => { await deleteAscent(fd) })
                  setConfirmOpen(false)
                }}
                onCancel={() => setConfirmOpen(false)}
                message={`Fjerne bestigning av ${peak.name}?`}
              />
            </div>
          ) : userId !== null && !isAscended ? (
            <button
              onClick={e => { e.stopPropagation(); setShowForm(v => !v) }}
              className="relative z-10 flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-parchment text-text-warm border border-border-warm hover:bg-forest-50 hover:text-forest hover:border-forest/20 transition-colors"
            >
              <CheckCircle2 size={11} strokeWidth={1.5} />
              + Bestigning
            </button>
          ) : null}
        </div>

        {/* Inline ascent form */}
        {showForm && (
          <form
            onSubmit={e => {
              e.preventDefault()
              e.stopPropagation()
              const fd = new FormData(e.currentTarget)
              startTransition(async () => { await logAscent(fd) })
              setShowForm(false)
            }}
            onClick={e => e.stopPropagation()}
            className="relative z-10 mt-2 p-2.5 rounded-lg bg-parchment border border-border-warm flex flex-col gap-2"
          >
            <input type="hidden" name="peak_id" value={peak.id} />
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-[10px] font-medium text-[#1A1A1A] mb-1">Dato</label>
                <input
                  type="date"
                  name="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  onClick={e => e.stopPropagation()}
                  className="w-full bg-white border border-border-warm rounded-md px-2 py-1 text-xs text-[#1A1A1A] focus:outline-none focus:border-forest transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                onClick={e => e.stopPropagation()}
                className="bg-forest text-white text-xs font-medium px-3 py-1 rounded-md hover:opacity-90 transition-opacity shrink-0 disabled:opacity-50"
              >
                {isPending ? '…' : 'Lagre'}
              </button>
            </div>
          </form>
        )}

        {/* Primærfaktor */}
        <div className="flex items-center gap-2 mb-1">
          <Navigation size={13} className="text-[#8B6914] shrink-0" strokeWidth={1.75} />
          <span className="text-xs text-text-warm">
            Primærfaktor: <span className="font-medium text-[#1A1A1A]">{(peak.primary_factor ?? 0).toLocaleString('no')} m</span>
          </span>
        </div>

        {/* Nærmeste høyere fjell */}
        {peak.nearest_higher_peak_id && (() => {
          const dist = higherPeak && peak.lat != null && peak.lng != null && higherPeak.lat != null && higherPeak.lng != null
            ? haversineKm(peak.lat, peak.lng, higherPeak.lat, higherPeak.lng)
            : null
          const parts: string[] = []
          if (higherPeak) parts.push(`${higherPeak.height.toLocaleString('no')} moh`)
          if (dist != null) parts.push(formatDist(dist * 1000))
          return (
            <div className="flex items-start gap-2 mb-1">
              <ArrowUpToLine size={13} className="text-[#8B6914] shrink-0 mt-0.5" strokeWidth={1.75} />
              <span className="text-xs text-text-warm">
                Nærmeste høyere:<br />
                <span className="font-medium text-[#1A1A1A]">
                  {higherPeak?.name ?? '–'}
                  {parts.length ? ` (${parts.join(' – ')})` : ''}
                </span>
              </span>
            </div>
          )
        })()}

        {/* Nærmeste over 2000 m */}
        {nearest && (
          <div className="flex items-start gap-2 mb-1">
            <Navigation size={13} className="text-text-warm shrink-0 mt-0.5" strokeWidth={1.75} />
            <span className="text-xs text-text-warm">
              {nearestHigherLabel}:<br />
              <span className="font-medium text-[#1A1A1A]">
                {nearest.peak.name} ({nearest.peak.height.toLocaleString('no')} moh – {formatDist(nearest.distanceKm * 1000)})
              </span>
            </span>
          </div>
        )}

        {/* Location */}
        <div className="flex items-center gap-2 mt-2">
          <MapPin size={13} className="text-text-warm shrink-0" strokeWidth={1.75} />
          <span className="text-xs text-text-warm truncate">
            {peak.municipality && peak.municipality !== 'Ukjent' ? `${peak.municipality}, ` : ''}{peak.county}
          </span>
        </div>

        {/* Nærliggende topper */}
        {nearbyPeaks.length > 0 && (
          <div className="mt-3">
            <button
              onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
              className="relative z-10 flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full transition-opacity hover:opacity-80"
              style={{ color: '#8B6914', background: '#FDF8EE', border: '1px solid #E8D5A3' }}
            >
              {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              {nearbyPeaks.length} nærliggende topper
            </button>
            {open && (
              <div className="relative z-10 mt-1.5 rounded-lg bg-[#F7F4EF] px-2.5 py-2 flex flex-col gap-1">
                {nearbyPeaks.map(p => (
                  <div key={p.id} className="flex items-baseline justify-between gap-2">
                    <span className="text-[11px] text-[#1A1A1A] truncate">{p.name}</span>
                    <span className="text-[11px] text-text-warm shrink-0">
                      {p.height.toLocaleString('no')} moh
                      <span className="text-[#8B6914] ml-1.5">Primærfaktor {(p.primary_factor ?? 0).toLocaleString('no')} m</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Eksterne lenker */}
        {(peak.peakbagger_id != null || peak.peakbook_id != null) && (
          <div className="relative z-10 flex items-center gap-3 mt-2">
            {peak.peakbagger_id != null && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  window.open(`https://www.peakbagger.com/peak.aspx?pid=${peak.peakbagger_id}`, '_blank', 'noopener,noreferrer')
                }}
                className="flex items-center gap-1 text-[11px] text-text-warm hover:text-forest transition-colors"
              >
                <ExternalLink size={11} strokeWidth={1.75} />
                Peakbagger
              </button>
            )}
            {peak.peakbook_id != null && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  window.open(`https://peakbook.org/peakbook-element/${peak.peakbook_id}/${encodeURIComponent(peak.name).replace(/%20/g, '+')}.html`, '_blank', 'noopener,noreferrer')
                }}
                className="flex items-center gap-1 text-[11px] text-text-warm hover:text-forest transition-colors"
              >
                <ExternalLink size={11} strokeWidth={1.75} />
                Peakbook
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-warm">
          {ascentCount && ascentCount > 0 ? (
            <span className="flex items-center gap-1 text-[10px] text-text-warm">
              <Users size={11} strokeWidth={1.75} />
              {ascentCount.toLocaleString('no')} bestigninger
            </span>
          ) : <span />}
          <ChevronRight size={15} className="text-border-warm group-hover:text-forest transition-colors" strokeWidth={1.75} />
        </div>

      </div>
    </div>
  )
}
