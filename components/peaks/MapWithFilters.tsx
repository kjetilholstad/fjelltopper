'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Search, ChevronDown } from 'lucide-react'
import type { Peak } from '@/types'

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

const LEGEND = [
  { color: '#1A3A0A', size: 14, label: 'Valgt topp' },
  { color: '#2D5016', size: 12, label: 'Moderfjell' },
  { color: '#2D5016', size: 10, label: 'Topp' },
  { color: '#5A8A30', size: 8,  label: 'Sub-topp' },
  { color: '#E8671A', size: 10, label: 'Sub-topper av valgt' },
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
  peaks: Peak[]
}

export function MapWithFilters({ peaks }: MapWithFiltersProps) {
  const [query, setQuery] = useState('')
  const [minHeight, setMinHeight] = useState('0')
  const [minPF, setMinPF] = useState('0')
  const [county, setCounty] = useState('')
  const [municipality, setMunicipality] = useState('')
  const [selectedPeak, setSelectedPeak] = useState<Peak | null>(null)

  const counties = useMemo(() => {
    const set = new Set<string>()
    peaks.forEach(p => { if (p.county && p.county !== 'Ukjent') set.add(p.county) })
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'no'))
  }, [peaks])

  const municipalities = useMemo(() => {
    const set = new Set<string>()
    const source = county ? peaks.filter(p => p.county === county) : peaks
    source.forEach(p => {
      if (!p.municipality || p.municipality === 'Ukjent') return
      p.municipality.split(',').forEach(m => {
        const trimmed = m.trim()
        if (trimmed) set.add(trimmed)
      })
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'no'))
  }, [peaks, county])

  const handleCountyChange = (v: string) => {
    setCounty(v)
    setMunicipality('')
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    const mh = parseInt(minHeight, 10) || 0
    const mpf = parseInt(minPF, 10) || 0

    return peaks.filter(p => {
      if (q && !p.name.toLowerCase().includes(q)) return false
      if (mh && p.height < mh) return false
      if (mpf && (p.primary_factor == null || p.primary_factor < mpf)) return false
      if (county && p.county !== county) return false
      if (municipality) {
        const muns = (p.municipality ?? '').split(',').map(m => m.trim())
        if (!muns.includes(municipality)) return false
      }
      return true
    })
  }, [peaks, query, minHeight, minPF, county, municipality])

  const parentPeak = useMemo(() => {
    if (!selectedPeak?.parent_peak) return null
    return peaks.find(p => p.name === selectedPeak.parent_peak) ?? null
  }, [peaks, selectedPeak])

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
        <div className="bg-white rounded-xl shadow-md border border-border-warm px-3 py-2.5 flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold text-text-warm uppercase tracking-wide mb-0.5">
            Tegnforklaring
          </p>
          {LEGEND.map(({ color, size, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div style={{
                width: size, height: size, borderRadius: '50%',
                background: color, border: '1.5px solid white',
                boxShadow: '0 1px 3px rgba(0,0,0,.25)', flexShrink: 0,
              }} />
              <span className="text-xs text-[#1A1A1A]">{label}</span>
            </div>
          ))}
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

            {/* Høyde · PF */}
            <p className="text-xs text-[#6B6560] mb-1">
              <strong className="text-[#1A1A1A]">{selectedPeak.height.toLocaleString('no')} moh</strong>
              <span className="mx-1.5 text-[#C8BFB5]">·</span>
              PF <strong className="text-[#1A1A1A]">{selectedPeak.primary_factor.toLocaleString('no')} m</strong>
            </p>

            {/* Sted */}
            {location && (
              <p className="text-[11px] text-text-warm mb-1.5">{location}</p>
            )}

            {/* Modertopp */}
            {parentPeak && (
              <div className="border-t border-border-warm pt-1.5 mb-1.5">
                <p className="text-[11px] font-semibold text-[#8B6914] mb-1">Modertopp</p>
                <div className="flex justify-between gap-2">
                  <span className="text-[11px] text-[#1A1A1A] truncate">{parentPeak.name}</span>
                  <span className="text-[11px] text-text-warm shrink-0">{parentPeak.height.toLocaleString('no')} m</span>
                </div>
              </div>
            )}

            {/* Sub-topper */}
            {selectedPeak.sub_peaks && selectedPeak.sub_peaks.length > 0 && (
              <div className="border-t border-border-warm pt-1.5 mb-1.5">
                <p className="text-[11px] font-semibold text-[#8B6914] mb-1">
                  Sub-topper ({selectedPeak.sub_peaks.length})
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
