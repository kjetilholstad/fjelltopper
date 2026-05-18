'use client'

import { useState, useMemo } from 'react'
import type { EnrichedPeak } from '@/types'

export function usePeakFilters(peaks: EnrichedPeak[]) {
  const [query, setQuery] = useState('')
  const [minHeight, setMinHeight] = useState('0')
  const [minPF, setMinPF] = useState('30')
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

  return {
    query, setQuery,
    minHeight, setMinHeight,
    minPF, setMinPF,
    county, setCounty,
    municipality, setMunicipality,
    handleCountyChange,
    counties,
    municipalities,
    filtered,
  }
}
