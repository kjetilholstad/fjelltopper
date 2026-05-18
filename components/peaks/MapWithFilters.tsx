'use client'

import { useState, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Search, ChevronDown } from 'lucide-react'
import type { EnrichedPeak } from '@/types'
import { nearestPeak } from '@/lib/nearestPeaks'
import { usePeakFilters } from '@/lib/hooks/usePeakFilters'

const PeakMap = dynamic(
  () => import('./PeakMap').then((m) => m.PeakMap),
  { ssr: false, loading: () => <div style={{ height: 'calc(100vh - 64px)' }} className="bg-parchment animate-pulse" /> }
)

const HEIGHT_OPTIONS = [
  { label: 'Alle høyder', value: '0' },
  { label: 'Over 2000 moh', value: '2000' },
  { label: 'Over 1800 moh', value: '1800' },
  { label: 'Over 1500 moh', value: '1500' },
  { label: 'Over 1000 moh', value: '1000' },
]

const PF_OPTIONS = [
  { label: 'Alle primærfaktorer', value: '0' },
  { label: 'PF over 10 m', value: '10' },
  { label: 'PF over 50 m', value: '50' },
  { label: 'PF over 100 m', value: '100' },
  { label: 'PF over 500 m', value: '500' },
  { label: 'PF over 1000 m', value: '1000' },
  { label: 'PF over 1500 m', value: '1500' },
  { label: 'PF over 2000 m', value: '2000' },
]

type LineType = 'higher' | 'nearest2000' | 'nearby'

const LEGEND_ITEMS: {
  color: string
  size: number
  label: string
  lineType: LineType | null
  dash: boolean
}[] = [
  { color: '#1A3A0A', size: 18, label: 'Valgt topp',             lineType: null,          dash: false },
  { color: '#D4A017', size: 13, label: 'Nærmeste høyere fjell',  lineType: 'higher',      dash: true  },
  { color: '#E8671A', size: 13, label: 'Nærmeste over 2000 m',   lineType: 'nearest2000', dash: true  },
  { color: '#DC2626', size: 11, label: 'Nærliggende topper',     lineType: 'nearby',      dash: false },
  { color: '#2D5016', size: 9,  label: 'Topp',                   lineType: null,          dash: false },
]

function Select({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { label: string; value: string }[]
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none w-full bg-white border border-border-warm rounded-lg px-3 py-1.5 pr-7 text-xs text-[#1A1A1A] focus:outline-none focus:border-forest transition-colors cursor-pointer"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-warm pointer-events-none" />
    </div>
  )
}

interface MapWithFiltersProps {
  peaks: EnrichedPeak[]
}

export function MapWithFilters({ peaks }: MapWithFiltersProps) {
  const {
    query, setQuery,
    minHeight, setMinHeight,
    minPF, setMinPF,
    county,
    municipality, setMunicipality,
    handleCountyChange,
    counties,
    municipalities,
    filtered,
  } = usePeakFilters(peaks)

  const [selectedPeak, setSelectedPeak] = useState<EnrichedPeak | null>(null)
  const [activeLines, setActiveLines] = useState<Set<LineType>>(new Set())

  function toggleLine(type: LineType) {
    setActiveLines(prev => {
      const next = new Set(prev)
      next.has(type) ? next.delete(type) : next.add(type)
      return next
    })
  }

  useEffect(() => {
    setActiveLines(new Set())
  }, [selectedPeak?.id])

  const nearest = useMemo(() => {
    if (!selectedPeak) return null
    return nearestPeak(selectedPeak, peaks)
  }, [selectedPeak, peaks])

  const higherPeakId = useMemo(() => {
    if (!selectedPeak?.nearest_higher_peak) return null
    return peaks.find(p => p.name === selectedPeak.nearest_higher_peak)?.id ?? null
  }, [selectedPeak, peaks])

  const nearest2000Id = useMemo(() => nearest?.peak.id ?? null, [nearest])

  const nearbyIds = useMemo<Set<string>>(() => {
    if (!selectedPeak?.sub_peaks) return new Set()
    return new Set(selectedPeak.sub_peaks.map(sp => sp.id))
  }, [selectedPeak])

  const lineData = useMemo(() => {
    if (!selectedPeak?.lat || !selectedPeak?.lng) return null
    const from: [number, number] = [selectedPeak.lat, selectedPeak.lng]

    const higherPeakEntry = peaks.find(p => p.name === selectedPeak.nearest_higher_peak)
    const toHigher = higherPeakEntry?.lat && higherPeakEntry?.lng
      ? [[from, [higherPeakEntry.lat, higherPeakEntry.lng]]] as [number, number][][]
      : null

    const nearestResult = nearestPeak(selectedPeak, peaks)
    const toNearest2000 = nearestResult?.peak.lat && nearestResult?.peak.lng
      ? [[from, [nearestResult.peak.lat, nearestResult.peak.lng]]] as [number, number][][]
      : null

    const toNearby = selectedPeak.sub_peaks
      ?.filter(sp => sp.lat && sp.lng)
      .map(sp => [from, [sp.lat!, sp.lng!]] as [number, number][]) ?? null

    return { toHigher, toNearest2000, toNearby }
  }, [selectedPeak, peaks])

  function lineAvailable(lineType: LineType): boolean {
    if (lineType === 'higher')      return !!lineData?.toHigher
    if (lineType === 'nearest2000') return !!lineData?.toNearest2000
    if (lineType === 'nearby')      return !!(lineData?.toNearby?.length)
    return false
  }

  const location = selectedPeak
    ? [
        selectedPeak.municipality && selectedPeak.municipality !== 'Ukjent'
          ? selectedPeak.municipality
          : null,
        selectedPeak.county,
      ].filter(Boolean).join(', ')
    : ''

  return (
    <div style={{ height: 'calc(100vh - 64px)', position: 'relative' }}>
      <PeakMap
        peaks={filtered}
        selectedPeakId={selectedPeak?.id ?? null}
        onSelectPeak={setSelectedPeak}
        activeLines={activeLines}
        lineData={lineData}
        higherPeakId={higherPeakId}
        nearest2000Id={nearest2000Id}
        nearbyIds={nearbyIds}
      />

      {/* Venstre kolonne: filter + tegnforklaring + detaljpanel */}
      <div
        style={{ position: 'absolute', top: 12, left: 12, zIndex: 1000, maxWidth: 400 }}
        className="w-[calc(100%-24px)] sm:w-auto flex flex-col gap-2"
      >
        {/* Filter panel */}
        <div className="bg-white rounded-xl shadow-md border border-border-warm p-3 flex flex-col gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-warm pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Søk etter topp…"
              className="w-full bg-parchment border border-border-warm rounded-lg pl-7 pr-3 py-1.5 text-xs text-[#1A1A1A] placeholder:text-text-warm focus:outline-none focus:border-forest transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <Select value={minHeight} onChange={setMinHeight} options={HEIGHT_OPTIONS} />
            <Select value={minPF} onChange={setMinPF} options={PF_OPTIONS} />
            <Select
              value={county}
              onChange={handleCountyChange}
              options={[{ label: 'Alle fylker', value: '' }, ...counties.map(c => ({ label: c, value: c }))]}
            />
            <Select
              value={municipality}
              onChange={setMunicipality}
              options={[{ label: 'Alle kommuner', value: '' }, ...municipalities.map(m => ({ label: m, value: m }))]}
            />
          </div>

          <p className="text-[11px] text-text-warm leading-none">
            <span className="font-semibold text-[#1A1A1A]">{filtered.length}</span>
            {' '}av{' '}
            <span className="font-semibold text-[#1A1A1A]">{peaks.length}</span>
            {' '}topper vises
          </p>
        </div>

        {/* Tegnforklaring */}
        <div className="bg-white rounded-xl shadow-md border border-border-warm px-3 py-2.5 flex flex-col gap-0.5">
          <p className="text-[10px] font-semibold text-text-warm uppercase tracking-wide mb-1">
            Tegnforklaring
          </p>

          {LEGEND_ITEMS.map(({ color, size, label, lineType, dash }) => {
            const isToggleable = lineType !== null
            const available = isToggleable ? lineAvailable(lineType) : true
            const isActive = isToggleable && activeLines.has(lineType)

            if (isToggleable) {
              return (
                <button
                  key={label}
                  onClick={() => available && toggleLine(lineType)}
                  disabled={!selectedPeak || !available}
                  className={[
                    'flex items-center gap-2 rounded-lg px-1.5 py-1 -mx-1.5 transition-colors text-left w-full',
                    !selectedPeak || !available ? 'opacity-35 cursor-not-allowed' : 'cursor-pointer hover:bg-parchment',
                    isActive ? 'bg-parchment' : '',
                  ].join(' ')}
                >
                  <div style={{
                    width: size, height: size, borderRadius: '50%', flexShrink: 0,
                    background: color, border: '1.5px solid white',
                    boxShadow: '0 1px 3px rgba(0,0,0,.25)',
                  }} />
                  <svg width="20" height="10" viewBox="0 0 20 10" style={{ flexShrink: 0 }}>
                    <line
                      x1="0" y1="5" x2="20" y2="5"
                      stroke={color}
                      strokeWidth="2"
                      strokeDasharray={dash ? '4 3' : undefined}
                    />
                  </svg>
                  <span className="text-xs text-[#1A1A1A]">{label}</span>
                  {isActive && (
                    <span className="ml-auto text-[10px] font-semibold" style={{ color }}>PÅ</span>
                  )}
                </button>
              )
            }

            return (
              <div key={label} className="flex items-center gap-2 px-1.5 py-1">
                <div style={{
                  width: size, height: size, borderRadius: '50%', flexShrink: 0,
                  background: color, border: '1.5px solid white',
                  boxShadow: '0 1px 3px rgba(0,0,0,.25)',
                }} />
                <span className="text-xs text-[#1A1A1A]">{label}</span>
              </div>
            )
          })}

          {!selectedPeak && (
            <p className="text-[10px] text-text-warm italic mt-0.5">
              Velg en topp for å aktivere linjer
            </p>
          )}
        </div>

        {/* Detaljpanel for valgt topp */}
        {selectedPeak && (
          <div
            className="bg-white rounded-xl shadow-md border border-border-warm"
            style={{ padding: '12px 14px' }}
          >
            {/* Navn + lukk */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="font-bold text-[#1A1A1A] text-sm leading-tight">{selectedPeak.name}</p>
              <button
                onClick={() => setSelectedPeak(null)}
                className="text-text-warm hover:text-[#1A1A1A] text-sm leading-none shrink-0 mt-0.5"
                aria-label="Lukk"
              >
                ✕
              </button>
            </div>

            {/* Høyde · Primærfaktor */}
            <p className="text-xs text-[#6B6560] mb-1">
              <strong className="text-[#1A1A1A]">{selectedPeak.height.toLocaleString('no')} moh</strong>
              <span className="mx-1.5 text-[#C8BFB5]">·</span>
              Primærfaktor <strong className="text-[#1A1A1A]">{(selectedPeak.primary_factor ?? 0).toLocaleString('no')} m</strong>
            </p>

            {/* Nærmeste høyere fjell */}
            {selectedPeak.nearest_higher_peak && selectedPeak.secondary_factor ? (
              <p className="text-[11px] text-text-warm mb-1">
                Nærmeste høyere: <span className="font-medium text-[#1A1A1A]">{selectedPeak.nearest_higher_peak} ({selectedPeak.secondary_factor < 1000 ? `${selectedPeak.secondary_factor.toLocaleString('no')} m` : `${Math.round(selectedPeak.secondary_factor / 1000).toLocaleString('no')} km`})</span>
              </p>
            ) : null}

            {/* Nærmeste fjell over 2000 m */}
            {nearest && (
              <p className="text-[11px] text-text-warm mb-1">
                Nærmeste over 2000 m: <span className="font-medium text-[#1A1A1A]">
                  {nearest.peak.name} ({nearest.distanceKm.toFixed(1).replace('.', ',')} km)
                </span>
              </p>
            )}

            {/* Sted */}
            {location && (
              <p className="text-[11px] text-text-warm mb-1.5">{location}</p>
            )}

            {/* Nærliggende topper — fra Peakbagger */}
            {selectedPeak.sub_peaks && selectedPeak.sub_peaks.length > 0 && (
              <div className="border-t border-border-warm pt-1.5 mb-1.5">
                <p className="text-[11px] font-semibold text-[#DC2626] mb-1">
                  Nærliggende topper ({selectedPeak.sub_peaks.length})
                </p>
                <div className="flex flex-col gap-0.5">
                  {selectedPeak.sub_peaks.map(sp => (
                    <div key={sp.id} className="flex justify-between gap-2">
                      <span className="text-[11px] text-[#1A1A1A] truncate">{sp.name}</span>
                      <span className="text-[11px] text-text-warm shrink-0">{sp.height.toLocaleString('no')} m</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lenke */}
            <Link
              href={`/peaks/${selectedPeak.id}`}
              className="text-xs font-semibold text-forest hover:underline"
            >
              Se detaljer →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
