'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Mountain, TrendingUp, Navigation, ArrowUpToLine, MapPin, CheckCircle2, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import type { EnrichedPeak } from '@/types'
import { nearestPeak } from '@/lib/nearestPeaks'
import { logAscent, deleteAscent } from '@/app/ascents/actions'

interface PeakCardProps {
  peak: EnrichedPeak
  rank?: number
  isAscended?: boolean
  userId?: string | null
  allPeaks?: EnrichedPeak[]
}

export function PeakCard({ peak, rank, isAscended = false, userId = null, allPeaks }: PeakCardProps) {
  const subPeaks = peak.sub_peaks ?? []
  const [open, setOpen] = useState(false)

  const nearest = useMemo(() => {
    if (!allPeaks) return null
    return nearestPeak(peak, allPeaks)
  }, [peak, allPeaks])

  return (
    <Link href={`/peaks/${peak.id}`} className="group block">
      <div className="bg-white rounded-xl border border-border-warm p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 h-full relative">
        {/* Rank badge */}
        {rank != null && (
          <span className="absolute top-3 right-3 text-[11px] font-semibold text-text-warm bg-parchment border border-border-warm rounded-full px-2 py-0.5">
            #{rank}
          </span>
        )}

        {/* Name */}
        <div className="flex items-start gap-2 mb-3 pr-8">
          <Mountain size={16} className="text-forest mt-0.5 shrink-0" strokeWidth={1.75} />
          <span className="font-bold text-[#1A1A1A] text-sm leading-tight">{peak.name}</span>
        </div>

        {/* Height */}
        <div className="flex items-center gap-2 mb-1.5">
          <TrendingUp size={14} className="text-forest shrink-0" strokeWidth={1.75} />
          <span className="text-lg font-bold text-[#1A1A1A]">{peak.height.toLocaleString('no')}</span>
          <span className="text-xs text-text-warm font-light">moh</span>
        </div>

        {/* Primærfaktor */}
        <div className="flex items-center gap-2 mb-1">
          <Navigation size={13} className="text-[#8B6914] shrink-0" strokeWidth={1.75} />
          <span className="text-xs text-text-warm">
            Primærfaktor: <span className="font-medium text-[#1A1A1A]">{(peak.primary_factor ?? 0).toLocaleString('no')} m</span>
          </span>
        </div>

        {/* Nærmeste høyere fjell */}
        {peak.nearest_higher_peak && (
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpToLine size={13} className="text-[#8B6914] shrink-0" strokeWidth={1.75} />
            <span className="text-xs text-text-warm">
              Nærmeste høyere: <span className="font-medium text-[#1A1A1A]">
                {peak.nearest_higher_peak}
                {peak.secondary_factor
                  ? ` (${peak.secondary_factor < 1000 ? `${peak.secondary_factor.toLocaleString('no')} m` : `${Math.round(peak.secondary_factor / 1000).toLocaleString('no')} km`})`
                  : ''}
              </span>
            </span>
          </div>
        )}

        {/* Nærmeste over 2000 m */}
        {nearest && (
          <div className="flex items-center gap-2 mb-1">
            <Navigation size={13} className="text-text-warm shrink-0" strokeWidth={1.75} />
            <span className="text-xs text-text-warm">
              Nærmeste over 2000 m: <span className="font-medium text-[#1A1A1A]">
                {nearest.peak.name} ({nearest.distanceKm.toFixed(1).replace('.', ',')} km)
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

        {/* Nærliggende topper — fra Peakbagger */}
        {subPeaks.length > 0 && (
          <div className="mt-3">
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(o => !o) }}
              className="flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full transition-opacity hover:opacity-80"
              style={{ color: '#8B6914', background: '#FDF8EE', border: '1px solid #E8D5A3' }}
            >
              {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              {subPeaks.length} nærliggende topper
            </button>
            {open && (
              <div className="mt-1.5 rounded-lg bg-[#F7F4EF] px-2.5 py-2 flex flex-col gap-1">
                {subPeaks.map(sp => (
                  <div key={sp.id} className="flex items-baseline justify-between gap-2">
                    <span className="text-[11px] text-[#1A1A1A] truncate">{sp.name}</span>
                    <span className="text-[11px] text-text-warm shrink-0">
                      {sp.height.toLocaleString('no')} moh
                      <span className="text-[#8B6914] ml-1.5">Primærfaktor {sp.pf.toLocaleString('no')} m</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-warm">
          {userId === null ? (
            <CheckCircle2 size={16} strokeWidth={1.5} className="text-border-warm" />
          ) : isAscended ? (
            <form action={deleteAscent} onClick={e => e.stopPropagation()}>
              <input type="hidden" name="peak_id" value={peak.id} />
              <button
                type="submit"
                title="Fjern bestigning"
                className="text-forest hover:text-red-400 transition-colors cursor-pointer"
              >
                <CheckCircle2 size={16} strokeWidth={1.5} fill="currentColor" />
              </button>
            </form>
          ) : (
            <form action={logAscent} onClick={e => e.stopPropagation()}>
              <input type="hidden" name="peak_id" value={peak.id} />
              <input type="hidden" name="date" value={new Date().toISOString().split('T')[0]} />
              <button
                type="submit"
                title="Registrer bestigning"
                className="text-border-warm hover:text-forest transition-colors cursor-pointer"
              >
                <CheckCircle2 size={16} strokeWidth={1.5} />
              </button>
            </form>
          )}
          <ChevronRight size={15} className="text-border-warm group-hover:text-forest transition-colors" strokeWidth={1.75} />
        </div>
      </div>
    </Link>
  )
}
