'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mountain, TrendingUp, Navigation, MapPin, CheckCircle2, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import type { Peak } from '@/types'

interface PeakCardProps {
  peak: Peak
  rank?: number
  isAscended?: boolean
}

export function PeakCard({ peak, rank, isAscended = false }: PeakCardProps) {
  const subPeaks = peak.sub_peaks ?? []
  const [open, setOpen] = useState(false)

  return (
    <Link href={`/peaks/${peak.id}`} className="group block">
      <div className="bg-white rounded-xl border border-border-warm p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 h-full relative">
        {/* Rank badge */}
        {rank != null && (
          <span className="absolute top-3 right-3 text-[11px] font-semibold text-text-warm bg-parchment border border-border-warm rounded-full px-2 py-0.5">
            #{rank}
          </span>
        )}

        {/* Name row */}
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

        {/* Primary factor */}
        {peak.primary_factor != null && (
          <div className="flex items-center gap-2 mb-1">
            <Navigation size={13} className="text-[#8B6914] shrink-0" strokeWidth={1.75} />
            <span className="text-xs text-text-warm">
              PF: <span className="font-medium text-[#1A1A1A]">{peak.primary_factor.toLocaleString('no')} m</span>
            </span>
          </div>
        )}

        {/* Secondary factor */}
        {peak.secondary_factor != null && (
          <div className="flex items-center gap-2 mb-1">
            <Navigation size={13} className="text-text-warm shrink-0" strokeWidth={1.75} />
            <span className="text-xs text-text-warm">
              SF: <span className="font-medium">{peak.secondary_factor.toLocaleString('no')} m</span>
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

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-warm">
          <CheckCircle2
            size={16}
            strokeWidth={1.5}
            className={isAscended ? 'text-forest' : 'text-border-warm'}
          />
          <ChevronRight size={15} className="text-border-warm group-hover:text-forest transition-colors" strokeWidth={1.75} />
        </div>

        {/* Sub-peaks */}
        {subPeaks.length > 0 && (
          <div className="mt-2">
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(o => !o) }}
              className="flex items-center gap-1 text-[11px] text-text-warm hover:text-forest transition-colors w-full"
            >
              {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {subPeaks.length} undertopper
            </button>
            {open && (
              <div className="mt-1.5 rounded-lg bg-[#F7F4EF] px-2.5 py-2 flex flex-col gap-1">
                {subPeaks.map((sp, i) => (
                  <div key={i} className="flex items-baseline justify-between gap-2">
                    <span className="text-[11px] text-[#1A1A1A] truncate">{sp.name}</span>
                    <span className="text-[11px] text-text-warm shrink-0">
                      {sp.height.toLocaleString('no')} moh
                      {sp.primary_factor != null && (
                        <span className="text-[#8B6914] ml-1.5">PF {sp.primary_factor.toLocaleString('no')} m</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
