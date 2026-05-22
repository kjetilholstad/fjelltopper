'use client'

import { useState, useMemo, useEffect, useTransition } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, ChevronDown, ChevronUp, CheckCircle2, SlidersHorizontal, Users } from 'lucide-react'
import type { EnrichedPeak } from '@/types'
import { nearestPeak, distanceToNearestHigher } from '@/lib/nearestPeaks'
import { usePeakFilters } from '@/lib/hooks/usePeakFilters'
import { logAscent, deleteAscent } from '@/app/ascents/actions'
import { getNearbyPeaks } from '@/lib/nearbyPeaks'
import { haversineKm } from '@/lib/nearestPeaks'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { formatDist } from '@/lib/utils'

const PeakMap = dynamic(
  () => import('./PeakMap').then((m) => m.PeakMap),
  { ssr: false, loading: () => <div style={{ height: 'calc(100vh - 64px)' }} className="bg-parchment animate-pulse" /> }
)

const ElevationProfile = dynamic(() => import('./ElevationProfile'), { ssr: false })

const HEIGHT_OPTIONS = [
  { label: 'Alle høyder',    value: '0'    },
  { label: 'Over 2000 moh', value: '2000' },
  { label: 'Over 2100 moh', value: '2100' },
  { label: 'Over 2200 moh', value: '2200' },
  { label: 'Over 2300 moh', value: '2300' },
  { label: 'Over 2400 moh', value: '2400' },
]

const PF_OPTIONS = [
  { label: 'Alle primærfaktorer', value: '0' },
  { label: 'PF over 10 m', value: '10' },
  { label: 'PF over 30 m', value: '30' },
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
  ascended?: boolean
}[] = [
  { color: '#1A3A0A', size: 18, label: 'Valgt topp',             lineType: null,          dash: false },
  { color: '#D4A017', size: 13, label: 'Nærmeste høyere fjell',  lineType: 'higher',      dash: true  },
  { color: '#E8671A', size: 13, label: 'Nærmeste over 2000 m (PF ≥ 30 m)',   lineType: 'nearest2000', dash: true  },
  { color: '#DC2626', size: 11, label: 'Nærliggende topper',     lineType: 'nearby',      dash: false },
  { color: '#ffffff', size: 11, label: 'Bestigning registrert',  lineType: null,          dash: false, ascended: true },
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

type AscentMapEntry = { id: string; date: string; notes: string | null; weather: string | null }

interface MapWithFiltersProps {
  peaks: EnrichedPeak[]
  ascendedMap?: Record<string, AscentMapEntry>
  isLoggedIn?: boolean
  userId?: string | null
  countMap?: Record<string, number>
}

export function MapWithFilters({ peaks, ascendedMap = {}, isLoggedIn = false, userId = null, countMap }: MapWithFiltersProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const ascendedSet = useMemo(() => new Set(Object.keys(ascendedMap)), [ascendedMap])

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
  } = usePeakFilters(peaks, '0')

  const [panelOpen, setPanelOpen] = useState(true)
  const [sheetExpanded, setSheetExpanded] = useState(false)

  const [selectedPeak, setSelectedPeak] = useState<EnrichedPeak | null>(null)
  const [activeLines, setActiveLines] = useState<Set<LineType>>(new Set())
  const [activeProfile, setActiveProfile] = useState<{ from: EnrichedPeak; to: EnrichedPeak } | null>(null)
  const [showOnlyAscended, setShowOnlyAscended] = useState(false)
  const [ascentDate, setAscentDate] = useState(new Date().toISOString().split('T')[0])
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    setAscentDate(new Date().toISOString().split('T')[0])
    setConfirmOpen(false)
  }, [selectedPeak?.id])

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

  const distToHigher = useMemo(
    () => selectedPeak ? distanceToNearestHigher(selectedPeak, peaks) : null,
    [selectedPeak, peaks]
  )

  const filteredWithAscended = useMemo(
    () => showOnlyAscended ? filtered.filter(p => ascendedSet.has(p.id)) : filtered,
    [filtered, showOnlyAscended, ascendedSet]
  )

  const higherPeakId = useMemo(() => {
    if (!selectedPeak?.nearest_higher_peak) return null
    return peaks.find(p => p.name === selectedPeak.nearest_higher_peak)?.id ?? null
  }, [selectedPeak, peaks])

  const nearest2000Id = useMemo(() => nearest?.peak.id ?? null, [nearest])

  const nearbyPeaks = useMemo(
    () => selectedPeak ? getNearbyPeaks(selectedPeak, peaks) : [],
    [selectedPeak, peaks]
  )

  const nearbyIds = useMemo<Set<string>>(
    () => new Set(nearbyPeaks.map(p => p.id)),
    [nearbyPeaks]
  )

  const lineData = useMemo(() => {
    if (!selectedPeak?.lat || !selectedPeak?.lng) return null
    const from: [number, number] = [selectedPeak.lat, selectedPeak.lng]

    const higherPeakEntry = peaks.find(p => p.name === selectedPeak.nearest_higher_peak)
    const toHigher = higherPeakEntry?.lat != null && higherPeakEntry?.lng != null
      ? [[from, [higherPeakEntry.lat, higherPeakEntry.lng]]] as [number, number][][]
      : null

    const higherDistKm = higherPeakEntry?.lat != null && higherPeakEntry?.lng != null
      ? haversineKm(selectedPeak.lat!, selectedPeak.lng!, higherPeakEntry.lat, higherPeakEntry.lng)
      : null
    const higherLabel = higherPeakEntry?.lat != null && higherPeakEntry?.lng != null && higherDistKm != null
      ? {
          pos: [(selectedPeak.lat! + higherPeakEntry.lat) / 2, (selectedPeak.lng! + higherPeakEntry.lng) / 2] as [number, number],
          text: formatDist(higherDistKm * 1000),
        }
      : null

    const nearestResult = nearestPeak(selectedPeak, peaks)
    const toNearest2000 = nearestResult?.peak.lat != null && nearestResult?.peak.lng != null
      ? [[from, [nearestResult.peak.lat, nearestResult.peak.lng]]] as [number, number][][]
      : null

    const nearest2000Label = nearestResult?.peak.lat != null && nearestResult?.peak.lng != null
      ? {
          pos: [(selectedPeak.lat! + nearestResult.peak.lat) / 2, (selectedPeak.lng! + nearestResult.peak.lng) / 2] as [number, number],
          text: formatDist(nearestResult.distanceKm * 1000),
        }
      : null

    const nearbyWithCoords = nearbyPeaks.filter(p => p.lat != null && p.lng != null)

    const toNearby = nearbyWithCoords
      .map(p => [from, [p.lat!, p.lng!]] as [number, number][])

    const nearbyLabels = nearbyWithCoords.map(p => {
      const midLat = (selectedPeak.lat! + p.lat!) / 2
      const midLng = (selectedPeak.lng! + p.lng!) / 2
      const distM = haversineKm(selectedPeak.lat!, selectedPeak.lng!, p.lat!, p.lng!) * 1000
      const text = formatDist(distM)
      return { pos: [midLat, midLng] as [number, number], text }
    })

    return { toHigher, higherLabel, toNearest2000, nearest2000Label, toNearby, nearbyLabels }
  }, [selectedPeak, peaks, nearbyPeaks])

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

  function handleLogAscent() {
    if (!selectedPeak) return
    const fd = new FormData()
    fd.append('peak_id', selectedPeak.id)
    fd.append('date', ascentDate)
    startTransition(async () => {
      await logAscent(fd)
      router.refresh()
    })
  }

  function handleDeleteAscent() {
    if (!selectedPeak) return
    const fd = new FormData()
    fd.append('peak_id', selectedPeak.id)
    startTransition(async () => {
      await deleteAscent(fd)
      router.refresh()
    })
    setConfirmOpen(false)
  }

  return (
    <div style={{ height: 'calc(100vh - 64px)', position: 'relative' }}>
      <PeakMap
        peaks={filteredWithAscended}
        selectedPeakId={selectedPeak?.id ?? null}
        onSelectPeak={peak => { setSelectedPeak(peak); if (peak) { setPanelOpen(true); setSheetExpanded(true) } }}
        activeLines={activeLines}
        lineData={lineData}
        higherPeakId={higherPeakId}
        nearest2000Id={nearest2000Id}
        nearbyIds={nearbyIds}
        ascendedIds={ascendedSet}
        onProfileChange={setActiveProfile}
      />

      {/* Venstre kolonne: filter + tegnforklaring + detaljpanel */}
      <div
        style={{ position: 'absolute', top: 12, left: 12, zIndex: 1000, maxWidth: 400 }}
        className={`hidden sm:flex ${panelOpen ? 'w-[calc(100%-24px)]' : 'w-auto'} sm:w-auto flex-col gap-2`}
      >
        {/* Kollaps-knapp */}
        <button
          onClick={() => setPanelOpen(o => !o)}
          className="flex items-center gap-1.5 bg-white rounded-lg shadow-md border border-border-warm px-3 py-1.5 text-xs font-medium text-[#6B6560] hover:text-[#1A1A1A] transition-colors self-start"
        >
          <SlidersHorizontal size={12} />
          {panelOpen ? 'Skjul' : 'Filter'}
          {panelOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {/* Filter panel */}
        {panelOpen && <div className="bg-white rounded-xl shadow-md border border-border-warm p-3 flex flex-col gap-2">
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

          {isLoggedIn && ascendedSet.size > 0 && (
            <button
              onClick={() => setShowOnlyAscended(v => !v)}
              className={[
                'flex items-center gap-2 w-full rounded-lg px-3 py-1.5 text-xs font-medium',
                'border transition-colors text-left',
                showOnlyAscended
                  ? 'bg-forest-50 text-forest border-forest/30'
                  : 'bg-white text-text-warm border-border-warm hover:border-forest/30 hover:text-forest',
              ].join(' ')}
            >
              <CheckCircle2
                size={13}
                strokeWidth={showOnlyAscended ? 2 : 1.5}
                className={showOnlyAscended ? 'text-forest' : 'text-text-warm'}
              />
              {showOnlyAscended
                ? `Viser ${ascendedSet.size} bestigninger`
                : `Kun mine bestigninger (${ascendedSet.size})`}
            </button>
          )}

          <p className="text-[11px] text-text-warm leading-none">
            <span className="font-semibold text-[#1A1A1A]">{filteredWithAscended.length}</span>
            {' '}av{' '}
            <span className="font-semibold text-[#1A1A1A]">{peaks.length}</span>
            {' '}topper vises
          </p>
        </div>}

        {/* Tegnforklaring */}
        {panelOpen && <div className="bg-white rounded-xl shadow-md border border-border-warm px-3 py-2.5 flex flex-col gap-0.5">
          <p className="text-[10px] font-semibold text-text-warm uppercase tracking-wide mb-1">
            Tegnforklaring
          </p>

          {LEGEND_ITEMS.map(({ color, size, label, lineType, dash, ascended }) => {
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
                {ascended ? (
                  <div style={{
                    width: size, height: size, borderRadius: '50%', flexShrink: 0,
                    background: 'white', border: '2px solid #2D5016',
                    boxShadow: '0 1px 3px rgba(0,0,0,.25)',
                  }} />
                ) : (
                  <div style={{
                    width: size, height: size, borderRadius: '50%', flexShrink: 0,
                    background: color, border: '1.5px solid white',
                    boxShadow: '0 1px 3px rgba(0,0,0,.25)',
                  }} />
                )}
                <span className="text-xs text-[#1A1A1A]">{label}</span>
              </div>
            )
          })}

          {!selectedPeak && (
            <p className="text-[10px] text-text-warm italic mt-0.5">
              Velg en topp for å aktivere linjer
            </p>
          )}
        </div>}

        {/* Detaljpanel for valgt topp */}
        {panelOpen && selectedPeak && (
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
            {selectedPeak.nearest_higher_peak && distToHigher != null ? (() => {
              const hp = peaks.find(p => p.name === selectedPeak.nearest_higher_peak)
              const parts: string[] = []
              if (hp) parts.push(`${hp.height.toLocaleString('no')} moh`)
              parts.push(formatDist(distToHigher * 1000))
              const suffix = ` (${parts.join(' – ')})`
              return (
                <p className="text-[11px] text-text-warm mb-1">
                  Nærmeste høyere:<br />
                  <span className="font-medium text-[#1A1A1A]">
                    {hp ? (
                      <button onClick={() => setSelectedPeak(hp)} className="underline decoration-dotted hover:text-forest transition-colors">
                        {selectedPeak.nearest_higher_peak}
                      </button>
                    ) : selectedPeak.nearest_higher_peak}
                    {suffix}
                  </span>
                </p>
              )
            })() : null}

            {/* Nærmeste fjell over 2000 m */}
            {nearest && (
              <p className="text-[11px] text-text-warm mb-1">
                Nærmeste over 2000 m (PF ≥ 30 m):<br />
                <span className="font-medium text-[#1A1A1A]">
                  <button onClick={() => setSelectedPeak(nearest.peak)} className="underline decoration-dotted hover:text-forest transition-colors">
                    {nearest.peak.name}
                  </button>
                  {' '}({nearest.peak.height.toLocaleString('no')} moh – {formatDist(nearest.distanceKm * 1000)})
                </span>
              </p>
            )}

            {/* Sted */}
            {location && (
              <p className="text-[11px] text-text-warm mb-1">{location}</p>
            )}

            {/* Bestigningsstatistikk */}
            {countMap && (countMap[selectedPeak.id] ?? 0) > 0 && (
              <p className="flex items-center gap-1 text-[10px] text-text-warm mb-1.5">
                <Users size={11} strokeWidth={1.75} />
                {countMap[selectedPeak.id].toLocaleString('no')} bestigninger
              </p>
            )}

            {/* Bestigning */}
            {isLoggedIn && (
              <div className="border-t border-border-warm mt-2 pt-2 mb-1.5">
                {ascendedSet.has(selectedPeak.id) ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-forest-50 text-forest border border-forest/20">
                      <CheckCircle2 size={11} strokeWidth={2} />
                      {new Date((ascendedMap[selectedPeak.id]?.date ?? '') + 'T12:00:00').toLocaleDateString('no-NO', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                    <button
                      onClick={() => setConfirmOpen(true)}
                      disabled={isPending}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                      Fjern
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="block text-[10px] font-medium text-[#1A1A1A] mb-1">Dato</label>
                      <input
                        type="date"
                        value={ascentDate}
                        onChange={e => setAscentDate(e.target.value)}
                        className="w-full bg-parchment border border-border-warm rounded-md px-2 py-1 text-xs text-[#1A1A1A] focus:outline-none focus:border-forest transition-colors"
                      />
                    </div>
                    <button
                      onClick={handleLogAscent}
                      disabled={isPending}
                      className="bg-forest text-white text-xs font-medium px-3 py-1 rounded-md hover:opacity-90 transition-opacity shrink-0 disabled:opacity-50"
                    >
                      {isPending ? '…' : '+ Bestigning'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Nærliggende topper */}
            {nearbyPeaks.length > 0 && (
              <div className="border-t border-border-warm pt-1.5 mb-1.5">
                <p className="text-[11px] font-semibold text-[#DC2626] mb-1">
                  Nærliggende topper ({nearbyPeaks.length})
                </p>
                <div className="flex flex-col gap-1">
                  {nearbyPeaks.map(p => {
                    const distKm = selectedPeak.lat != null && selectedPeak.lng != null && p.lat != null && p.lng != null
                      ? haversineKm(selectedPeak.lat, selectedPeak.lng, p.lat, p.lng)
                      : null
                    return (
                      <div key={p.id} className="flex flex-col">
                        <span className="text-[11px] font-medium text-[#1A1A1A]">{p.name}</span>
                        <span className="text-[10px] text-text-warm">
                          {p.height.toLocaleString('no')} moh
                          {distKm != null && ` · ${formatDist(distKm * 1000)}`}
                          {p.primary_factor != null && ` · PF ${p.primary_factor.toLocaleString('no')} m`}
                        </span>
                      </div>
                    )
                  })}
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

        {/* Høydeprofil */}
        {panelOpen && activeProfile &&
          activeProfile.from.lat != null && activeProfile.from.lng != null &&
          activeProfile.to.lat   != null && activeProfile.to.lng   != null && (
          <ElevationProfile
            fromName={activeProfile.from.name}
            toName={activeProfile.to.name}
            fromLat={activeProfile.from.lat}
            fromLng={activeProfile.from.lng}
            toLat={activeProfile.to.lat}
            toLng={activeProfile.to.lng}
            onClose={() => setActiveProfile(null)}
          />
        )}
      </div>

      {/* Mobil bottom sheet */}
      <div
        className="sm:hidden fixed bottom-0 left-0 right-0 z-[2000] bg-white rounded-t-2xl shadow-2xl border-t border-[#E8E2D9] transition-transform duration-300 ease-out flex flex-col"
        style={{ height: '65vh', transform: sheetExpanded ? 'translateY(0)' : 'translateY(calc(65vh - 64px))', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Håndtak */}
        <button
          onClick={() => setSheetExpanded(o => !o)}
          className="flex flex-col items-center gap-2 pt-2 pb-3 px-4 shrink-0"
          aria-label={sheetExpanded ? 'Lukk panel' : 'Åpne panel'}
        >
          <div className="w-10 h-1 rounded-full bg-[#E8E2D9]" />
          <div className="flex items-center justify-between w-full">
            {selectedPeak ? (
              <span className="text-sm font-semibold text-[#1A1A1A] truncate">
                {selectedPeak.name} — {selectedPeak.height.toLocaleString('no')} moh
              </span>
            ) : (
              <span className="text-sm font-medium text-[#6B6560]">
                {filteredWithAscended.length} topper vises
              </span>
            )}
            {sheetExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </div>
        </button>

        {/* Scrollbart innhold */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col gap-3">
          {/* Filter-seksjon */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-[#1A1A1A]">Filter</p>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-warm pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Søk etter topp…"
                className="w-full bg-parchment border border-border-warm rounded-lg pl-7 pr-3 py-2 text-sm text-[#1A1A1A] placeholder:text-text-warm focus:outline-none focus:border-forest"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
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
            {isLoggedIn && ascendedSet.size > 0 && (
              <button
                onClick={() => setShowOnlyAscended(v => !v)}
                className={[
                  'flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm font-medium border transition-colors text-left',
                  showOnlyAscended
                    ? 'bg-forest-50 text-forest border-forest/30'
                    : 'bg-white text-text-warm border-border-warm',
                ].join(' ')}
              >
                <CheckCircle2
                  size={14}
                  strokeWidth={showOnlyAscended ? 2 : 1.5}
                  className={showOnlyAscended ? 'text-forest' : 'text-text-warm'}
                />
                {showOnlyAscended ? `Viser ${ascendedSet.size} bestigninger` : `Kun mine (${ascendedSet.size})`}
              </button>
            )}
            <p className="text-xs text-text-warm">
              <span className="font-semibold text-[#1A1A1A]">{filteredWithAscended.length}</span>
              {' '}av{' '}
              <span className="font-semibold text-[#1A1A1A]">{peaks.length}</span>
              {' '}topper
            </p>
          </div>

          {/* Tegnforklaring */}
          <div className="border-t border-[#E8E2D9] pt-3 flex flex-col gap-1">
            <p className="text-xs font-semibold text-[#6B6560] uppercase tracking-wide mb-1">
              Tegnforklaring
            </p>
            {LEGEND_ITEMS.map(({ color, size, label, lineType, dash, ascended }) => {
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
                      'flex items-center gap-2 rounded-lg px-2 py-2 -mx-2 transition-colors text-left w-full',
                      !selectedPeak || !available ? 'opacity-35 cursor-not-allowed' : 'cursor-pointer active:bg-parchment',
                      isActive ? 'bg-parchment' : '',
                    ].join(' ')}
                  >
                    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0,
                      background: color, border: '1.5px solid white',
                      boxShadow: '0 1px 3px rgba(0,0,0,.25)' }} />
                    <svg width="20" height="10" viewBox="0 0 20 10" style={{ flexShrink: 0 }}>
                      <line x1="0" y1="5" x2="20" y2="5" stroke={color} strokeWidth="2"
                        strokeDasharray={dash ? '4 3' : undefined} />
                    </svg>
                    <span className="text-sm text-[#1A1A1A]">{label}</span>
                    {isActive && (
                      <span className="ml-auto text-xs font-semibold" style={{ color }}>PÅ</span>
                    )}
                  </button>
                )
              }
              return (
                <div key={label} className="flex items-center gap-2 px-2 py-1.5">
                  {ascended ? (
                    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0,
                      background: 'white', border: '2px solid #2D5016',
                      boxShadow: '0 1px 3px rgba(0,0,0,.25)' }} />
                  ) : (
                    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0,
                      background: color, border: '1.5px solid white',
                      boxShadow: '0 1px 3px rgba(0,0,0,.25)' }} />
                  )}
                  <span className="text-sm text-[#1A1A1A]">{label}</span>
                </div>
              )
            })}
            {!selectedPeak && (
              <p className="text-xs text-text-warm italic mt-0.5">
                Velg en topp for å aktivere linjer
              </p>
            )}
          </div>

          {/* Valgt topp */}
          {selectedPeak && (
            <div className="border-t border-[#E8E2D9] pt-3 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-[#1A1A1A] text-base leading-tight">{selectedPeak.name}</p>
                <button
                  onClick={() => setSelectedPeak(null)}
                  className="text-text-warm hover:text-[#1A1A1A] leading-none shrink-0 mt-0.5"
                  aria-label="Lukk"
                >
                  ✕
                </button>
              </div>

              <p className="text-sm text-[#6B6560]">
                <strong className="text-[#1A1A1A]">{selectedPeak.height.toLocaleString('no')} moh</strong>
                <span className="mx-1.5 text-[#C8BFB5]">·</span>
                Primærfaktor <strong className="text-[#1A1A1A]">{(selectedPeak.primary_factor ?? 0).toLocaleString('no')} m</strong>
              </p>

              {selectedPeak.nearest_higher_peak && distToHigher != null && (() => {
                const hp = peaks.find(p => p.name === selectedPeak.nearest_higher_peak)
                const parts: string[] = []
                if (hp) parts.push(`${hp.height.toLocaleString('no')} moh`)
                parts.push(formatDist(distToHigher * 1000))
                const suffix = ` (${parts.join(' – ')})`
                return (
                  <div>
                    <p className="text-xs text-text-warm">Nærmeste høyere</p>
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      {hp ? (
                        <button onClick={() => setSelectedPeak(hp)} className="underline decoration-dotted hover:text-forest transition-colors">
                          {selectedPeak.nearest_higher_peak}
                        </button>
                      ) : selectedPeak.nearest_higher_peak}
                      {suffix}
                    </p>
                  </div>
                )
              })()}

              {nearest && (
                <div>
                  <p className="text-xs text-text-warm">Nærmeste over 2000 m (PF ≥ 30 m)</p>
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    <button onClick={() => setSelectedPeak(nearest.peak)} className="underline decoration-dotted hover:text-forest transition-colors">
                      {nearest.peak.name}
                    </button>
                    {' '}({nearest.peak.height.toLocaleString('no')} moh – {formatDist(nearest.distanceKm * 1000)})
                  </p>
                </div>
              )}

              {location && <p className="text-sm text-text-warm">{location}</p>}

              {countMap && (countMap[selectedPeak.id] ?? 0) > 0 && (
                <p className="flex items-center gap-1 text-sm text-text-warm">
                  <Users size={13} strokeWidth={1.75} />
                  {countMap[selectedPeak.id].toLocaleString('no')} bestigninger
                </p>
              )}

              {isLoggedIn && (
                <div className="border-t border-border-warm pt-3">
                  {ascendedSet.has(selectedPeak.id) ? (
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full bg-forest-50 text-forest border border-forest/20">
                        <CheckCircle2 size={13} strokeWidth={2} />
                        {new Date((ascendedMap[selectedPeak.id]?.date ?? '') + 'T12:00:00').toLocaleDateString('no-NO', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </span>
                      <button
                        onClick={() => setConfirmOpen(true)}
                        disabled={isPending}
                        className="text-sm text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        Fjern
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-[#1A1A1A] mb-1">Dato</label>
                        <input
                          type="date"
                          value={ascentDate}
                          onChange={e => setAscentDate(e.target.value)}
                          className="w-full bg-parchment border border-border-warm rounded-md px-2 py-1.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-forest transition-colors"
                        />
                      </div>
                      <button
                        onClick={handleLogAscent}
                        disabled={isPending}
                        className="bg-forest text-white text-sm font-medium px-4 py-1.5 rounded-md hover:opacity-90 transition-opacity shrink-0 disabled:opacity-50"
                      >
                        {isPending ? '…' : '+ Bestigning'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {nearbyPeaks.length > 0 && (
                <div className="border-t border-border-warm pt-2">
                  <p className="text-sm font-semibold text-[#DC2626] mb-1">
                    Nærliggende topper ({nearbyPeaks.length})
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {nearbyPeaks.map(p => {
                      const distKm = selectedPeak.lat != null && selectedPeak.lng != null && p.lat != null && p.lng != null
                        ? haversineKm(selectedPeak.lat, selectedPeak.lng, p.lat, p.lng)
                        : null
                      return (
                        <div key={p.id} className="flex flex-col">
                          <span className="text-sm font-medium text-[#1A1A1A]">{p.name}</span>
                          <span className="text-xs text-text-warm">
                            {p.height.toLocaleString('no')} moh
                            {distKm != null && ` · ${formatDist(distKm * 1000)}`}
                            {p.primary_factor != null && ` · PF ${p.primary_factor.toLocaleString('no')} m`}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <Link
                href={`/peaks/${selectedPeak.id}`}
                className="text-sm font-semibold text-forest hover:underline"
              >
                Se detaljer →
              </Link>
            </div>
          )}
          <div style={{ height: 'env(safe-area-inset-bottom)' }} />
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onConfirm={handleDeleteAscent}
        onCancel={() => setConfirmOpen(false)}
        message={selectedPeak ? `Fjerne bestigning av ${selectedPeak.name}?` : 'Er du sikker?'}
      />
    </div>
  )
}
