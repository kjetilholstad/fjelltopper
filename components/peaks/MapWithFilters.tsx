'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
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

  return (
    <div style={{ height: 'calc(100vh - 64px)', position: 'relative' }}>
      {/* Map — full size */}
      <PeakMap peaks={filtered} />

      {/* Filter overlay — absolute top-left on top of the map */}
      <div
        style={{ position: 'absolute', top: 12, left: 12, zIndex: 1000, maxWidth: 400 }}
        className="w-[calc(100%-24px)] sm:w-auto bg-white rounded-xl shadow-md border border-border-warm p-3 flex flex-col gap-2"
      >
        {/* Search */}
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

        {/* Dropdowns — 2-column grid */}
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

        {/* Count */}
        <p className="text-[11px] text-text-warm leading-none">
          <span className="font-semibold text-[#1A1A1A]">{filtered.length}</span>
          {' '}av{' '}
          <span className="font-semibold text-[#1A1A1A]">{peaks.length}</span>
          {' '}topper vises
        </p>
      </div>
    </div>
  )
}
