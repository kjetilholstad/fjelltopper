'use client'

import { useState, useMemo } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { PeakCard } from './PeakCard'
import type { Peak } from '@/types'

interface PeakListProps {
  peaks: Peak[]
}

const HEIGHT_OPTIONS = [
  { label: 'Alle høyder', value: 0 },
  { label: 'Over 2000 moh', value: 2000 },
  { label: 'Over 1800 moh', value: 1800 },
  { label: 'Over 1500 moh', value: 1500 },
  { label: 'Over 1000 moh', value: 1000 },
]

const PF_OPTIONS = [
  { label: 'Alle primærfaktorer', value: 0 },
  { label: 'PF over 10 m', value: 10 },
  { label: 'PF over 50 m', value: 50 },
  { label: 'PF over 100 m', value: 100 },
  { label: 'PF over 500 m', value: 500 },
  { label: 'PF over 1000 m', value: 1000 },
  { label: 'PF over 1500 m', value: 1500 },
  { label: 'PF over 2000 m', value: 2000 },
]

const SORT_OPTIONS = [
  { label: 'Høyde (høyest først)', value: 'height_desc' },
  { label: 'Høyde (lavest først)', value: 'height_asc' },
  { label: 'Primærfaktor (høyest først)', value: 'pf_desc' },
  { label: 'Primærfaktor (laveste først)', value: 'pf_asc' },
  { label: 'Navn (A–Å)', value: 'name_asc' },
]

function Select({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { label: string; value: string | number }[]
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none w-full bg-white border border-border-warm rounded-lg px-3 py-2 pr-8 text-sm text-[#1A1A1A] focus:outline-none focus:border-forest transition-colors cursor-pointer"
      >
        {options.map(o => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-warm pointer-events-none" />
    </div>
  )
}

export function PeakList({ peaks }: PeakListProps) {
  const [query, setQuery] = useState('')
  const [minHeight, setMinHeight] = useState('0')
  const [minPF, setMinPF] = useState('0')
  const [county, setCounty] = useState('')
  const [municipality, setMunicipality] = useState('')
  const [sort, setSort] = useState('height_desc')

  // Derive unique counties from all peaks
  const counties = useMemo(() => {
    const set = new Set<string>()
    peaks.forEach(p => { if (p.county && p.county !== 'Ukjent') set.add(p.county) })
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'no'))
  }, [peaks])

  // Derive municipalities filtered by selected county
  const municipalities = useMemo(() => {
    const set = new Set<string>()
    const source = county ? peaks.filter(p => p.county === county) : peaks
    source.forEach(p => {
      if (!p.municipality || p.municipality === 'Ukjent') return
      // Split comma-separated municipalities (e.g. "Lom , Vågå")
      p.municipality.split(',').forEach(m => {
        const trimmed = m.trim()
        if (trimmed) set.add(trimmed)
      })
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'no'))
  }, [peaks, county])

  // Reset municipality when county changes
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

  const sorted = useMemo(() => {
    const arr = [...filtered]
    if (sort === 'height_asc') arr.sort((a, b) => a.height - b.height)
    else if (sort === 'height_desc') arr.sort((a, b) => b.height - a.height)
    else if (sort === 'pf_desc') arr.sort((a, b) => (b.primary_factor ?? 0) - (a.primary_factor ?? 0))
    else if (sort === 'pf_asc') arr.sort((a, b) => (a.primary_factor ?? Infinity) - (b.primary_factor ?? Infinity))
    else if (sort === 'name_asc') arr.sort((a, b) => a.name.localeCompare(b.name, 'no'))
    return arr
  }, [filtered, sort])

  // Build a rank map (by global height rank, not filtered rank)
  const rankMap = useMemo(() => {
    const byHeight = [...peaks].sort((a, b) => b.height - a.height)
    const m = new Map<string, number>()
    byHeight.forEach((p, i) => m.set(p.id, i + 1))
    return m
  }, [peaks])

  return (
    <div>
      {/* Filter panel */}
      <div className="bg-white rounded-xl border border-border-warm shadow-sm p-4 mb-6">
        <div className="flex flex-col gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-warm pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Søk etter fjellnavn…"
              className="w-full bg-parchment border border-border-warm rounded-lg pl-9 pr-3 py-2 text-sm text-[#1A1A1A] placeholder:text-text-warm focus:outline-none focus:border-forest transition-colors"
            />
          </div>

          {/* Filter row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            <Select
              value={minHeight}
              onChange={setMinHeight}
              options={HEIGHT_OPTIONS.map(o => ({ ...o, value: String(o.value) }))}
            />
            <Select
              value={minPF}
              onChange={setMinPF}
              options={PF_OPTIONS.map(o => ({ ...o, value: String(o.value) }))}
            />
            <Select
              value={county}
              onChange={handleCountyChange}
              options={[
                { label: 'Alle fylker', value: '' },
                ...counties.map(c => ({ label: c, value: c })),
              ]}
            />
            <Select
              value={municipality}
              onChange={setMunicipality}
              options={[
                { label: 'Alle kommuner', value: '' },
                ...municipalities.map(m => ({ label: m, value: m })),
              ]}
            />
            <Select
              value={sort}
              onChange={setSort}
              options={SORT_OPTIONS}
            />
          </div>
        </div>

        {/* Result count */}
        <p className="text-xs text-text-warm mt-3">
          Viser <span className="font-semibold text-[#1A1A1A]">{sorted.length}</span> av{' '}
          <span className="font-semibold text-[#1A1A1A]">{peaks.length}</span> topper
        </p>
      </div>

      {/* Grid */}
      {sorted.length === 0 ? (
        <p className="text-center text-text-warm py-16">Ingen topper matcher søket ditt.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map(peak => (
            <PeakCard
              key={peak.id}
              peak={peak}
              rank={rankMap.get(peak.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
