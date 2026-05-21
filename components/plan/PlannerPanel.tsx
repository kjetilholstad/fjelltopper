'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, Trash2, Download, RotateCcw, Route, Minus } from 'lucide-react'
import type { Waypoint, LegStats } from '@/types/planner'

const HEIGHT_OPTIONS = [
  { label: 'Alle høyder',    value: '0'    },
  { label: 'Over 2000 moh', value: '2000' },
  { label: 'Over 2100 moh', value: '2100' },
  { label: 'Over 2200 moh', value: '2200' },
  { label: 'Over 2300 moh', value: '2300' },
  { label: 'Over 2400 moh', value: '2400' },
]

const PF_OPTIONS = [
  { label: 'Alle primærfaktorer', value: '0'    },
  { label: 'PF over 10 m',        value: '10'   },
  { label: 'PF over 30 m',        value: '30'   },
  { label: 'PF over 50 m',        value: '50'   },
  { label: 'PF over 100 m',       value: '100'  },
  { label: 'PF over 500 m',       value: '500'  },
  { label: 'PF over 1000 m',      value: '1000' },
  { label: 'PF over 1500 m',      value: '1500' },
  { label: 'PF over 2000 m',      value: '2000' },
]

const formatTime = (h: number) =>
  `${Math.floor(h)}t ${Math.round((h % 1) * 60)}min`

function exportGPX(waypoints: Waypoint[], legs: (LegStats | null)[], name: string) {
  const safeName = name.trim().replace(/[^\w\s\-æøåÆØÅ]/g, '').trim() || 'turplan'
  const trackpts = legs.flatMap((leg, i): string[] => {
    if (leg?.geometry && leg.geometry.length >= 2) {
      return leg.geometry.map(([lat, lng]) => `\n      <trkpt lat="${lat.toFixed(6)}" lon="${lng.toFixed(6)}"></trkpt>`)
    }
    const from = waypoints[i], to = waypoints[i + 1]
    if (!from || !to) return []
    return [
      `\n      <trkpt lat="${from.lat.toFixed(6)}" lon="${from.lng.toFixed(6)}"></trkpt>`,
      `\n      <trkpt lat="${to.lat.toFixed(6)}" lon="${to.lng.toFixed(6)}"></trkpt>`,
    ]
  })

  const gpx =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<gpx version="1.1" creator="Fjelltopper" xmlns="http://www.topografix.com/GPX/1/1">\n` +
    `  <trk><name>${safeName}</name><trkseg>` +
    trackpts.join('') +
    `\n  </trkseg></trk>\n</gpx>`

  const blob = new Blob([gpx], { type: 'application/gpx+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `${safeName}.gpx`; a.click()
  URL.revokeObjectURL(url)
}

interface PlannerPanelProps {
  waypoints: Waypoint[]
  legs: (LegStats | null)[]
  totalTime: { naismith: number; toblerStd: number; toblerCal: number }
  activeLayer: 'topo' | 'topo2'
  minHeight: string
  minPF: string
  loading: boolean
  peakCount: number
  totalPeakCount: number
  onLayerChange: (layer: 'topo' | 'topo2') => void
  onMinHeightChange: (v: string) => void
  onMinPFChange: (v: string) => void
  onRemoveWaypoint: (id: string) => void
  onClearAll: () => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  onToggleLegSnap: (waypointIndex: number) => void
}

export function PlannerPanel({
  waypoints, legs, totalTime, activeLayer, minHeight, minPF, loading,
  peakCount, totalPeakCount,
  onLayerChange, onMinHeightChange, onMinPFChange, onRemoveWaypoint, onClearAll, onMoveUp, onMoveDown,
  onToggleLegSnap,
}: PlannerPanelProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [gpxDialogOpen, setGpxDialogOpen] = useState(false)
  const [gpxName, setGpxName] = useState('')

  function openGpxDialog() {
    const first = waypoints[0]?.label
    const last  = waypoints[waypoints.length - 1]?.label
    const defaultName = first && last && first !== last
      ? `${first}–${last}`
      : first ?? 'Turplan'
    setGpxName(defaultName)
    setGpxDialogOpen(true)
  }

  const totalDist  = legs.reduce((s, l) => s + (l?.distanceKm ?? 0), 0)
  const totalAsc   = legs.reduce((s, l) => s + (l?.ascentM   ?? 0), 0)
  const totalDesc  = legs.reduce((s, l) => s + (l?.descentM  ?? 0), 0)

  const desktopContent = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Kartlag */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E2D9]">
        <p className="text-xs font-semibold text-[#1A1A1A]">Kartlag</p>
        <div className="flex gap-1">
          {(['topo', 'topo2'] as const).map(key => (
            <button
              key={key}
              onClick={() => onLayerChange(key)}
              className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                activeLayer === key
                  ? 'bg-forest text-white'
                  : 'bg-[#F7F4EF] text-[#6B6560] border border-[#E8E2D9]'
              }`}
            >
              {key === 'topo' ? 'Kartverket' : 'OpenTopo'}
            </button>
          ))}
        </div>
      </div>

      {/* Peak height filter */}
      <div className="px-4 py-3 border-b border-[#E8E2D9]">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-[#1A1A1A]">Vis fjelltoppar</p>
          <span className="text-[10px] text-[#A89F96]">{peakCount} av {totalPeakCount}</span>
        </div>
        <div className="relative">
          <select
            value={minHeight}
            onChange={e => onMinHeightChange(e.target.value)}
            className="appearance-none w-full bg-[#F7F4EF] border border-[#E8E2D9] rounded-lg px-3 py-1.5 pr-7 text-xs text-[#1A1A1A] focus:outline-none focus:border-forest transition-colors cursor-pointer"
          >
            {HEIGHT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#A89F96] pointer-events-none" />
        </div>
        <div className="relative mt-1.5">
          <select
            value={minPF}
            onChange={e => onMinPFChange(e.target.value)}
            className="appearance-none w-full bg-[#F7F4EF] border border-[#E8E2D9] rounded-lg px-3 py-1.5 pr-7 text-xs text-[#1A1A1A] focus:outline-none focus:border-forest transition-colors cursor-pointer"
          >
            {PF_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#A89F96] pointer-events-none" />
        </div>
        <p className="text-[10px] text-[#A89F96] mt-1.5">Klikk på en topp for å legge den til</p>
      </div>

      {/* Stats */}
      {waypoints.length >= 2 && (
        <div className="grid grid-cols-2 gap-2 p-3 border-b border-[#E8E2D9]">
          <div className="bg-[#F7F4EF] rounded-lg px-3 py-2 text-center border border-[#E8E2D9]">
            <p className="text-[10px] text-[#6B6560]">Distanse</p>
            <p className="text-sm font-bold text-[#1A1A1A]">{totalDist.toFixed(1)} km</p>
          </div>
          <div className="bg-[#F7F4EF] rounded-lg px-3 py-2 border border-[#E8E2D9]">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] text-[#A89F96] uppercase tracking-wide">Gangtid (bevegelse)</p>
              <div className="space-y-0.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#A89F96]">Naismith</span>
                  <span className="font-medium text-[#1A1A1A]">{formatTime(totalTime.naismith)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A89F96]">Tobler</span>
                  <span className="font-medium text-[#1A1A1A]">{formatTime(totalTime.toblerStd)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#2D5016] font-medium">Kalibrert ↗</span>
                  <span className="font-medium text-[#2D5016]">{formatTime(totalTime.toblerCal)}</span>
                </div>
              </div>
              <p className="text-[10px] text-[#A89F96] mt-1">+ ca. 25–35 % for pauser</p>
            </div>
          </div>
          <div className="bg-[#F7F4EF] rounded-lg px-3 py-2 text-center border border-[#E8E2D9]">
            <p className="text-[10px] text-[#6B6560]">Stigning</p>
            <p className="text-sm font-bold text-[#1A1A1A]">{totalAsc.toLocaleString('no')} m</p>
          </div>
          <div className="bg-[#F7F4EF] rounded-lg px-3 py-2 text-center border border-[#E8E2D9]">
            <p className="text-[10px] text-[#6B6560]">Nedstigning</p>
            <p className="text-sm font-bold text-[#1A1A1A]">{totalDesc.toLocaleString('no')} m</p>
          </div>
        </div>
      )}

      {/* Waypoint list */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {waypoints.length === 0 ? (
          <p className="text-xs text-[#A89F96] text-center py-8">
            Klikk på kartet eller en topp for å legge til vegpunkter
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {waypoints.map((wp, i) => (
              <div key={wp.id} className="flex items-center gap-2 bg-[#F7F4EF] rounded-lg px-2.5 py-2 border border-[#E8E2D9]">
                <span
                  className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                  style={{ background: i === 0 ? '#2D5016' : i === waypoints.length - 1 ? '#D4A017' : '#E8671A' }}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#1A1A1A] truncate">
                    {wp.label ?? `${wp.lat.toFixed(4)}°, ${wp.lng.toFixed(4)}°`}
                  </p>
                  {i > 0 && legs[i - 1] && (
                    <p className="text-[10px] text-[#6B6560]">
                      {legs[i - 1]!.distanceKm.toFixed(1)} km · +{legs[i - 1]!.ascentM.toLocaleString('no')} m
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => onMoveUp(i)}
                    disabled={i === 0}
                    className="p-0.5 text-[#A89F96] hover:text-[#1A1A1A] disabled:opacity-25 transition-colors"
                  >
                    <ChevronUp size={13} />
                  </button>
                  <button
                    onClick={() => onMoveDown(i)}
                    disabled={i === waypoints.length - 1}
                    className="p-0.5 text-[#A89F96] hover:text-[#1A1A1A] disabled:opacity-25 transition-colors"
                  >
                    <ChevronDown size={13} />
                  </button>
                  {i < waypoints.length - 1 && (
                    <button
                      onClick={() => onToggleLegSnap(i)}
                      title={wp.snapToNext ? 'Følger sti → klikk for rett linje' : 'Rett linje → klikk for rute langs sti'}
                      className={`p-0.5 rounded transition-colors ${
                        wp.snapToNext
                          ? 'text-[#2D5016] bg-[#f0f5e8] border border-[#2D5016]/30'
                          : 'text-[#A89F96] bg-[#F7F4EF] border border-[#E8E2D9]'
                      }`}
                    >
                      {wp.snapToNext ? <Route size={11} /> : <Minus size={11} />}
                    </button>
                  )}
                  <button
                    onClick={() => onRemoveWaypoint(wp.id)}
                    className="p-0.5 text-[#A89F96] hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading bar */}
      {loading && (
        <div className="px-3 py-2 border-t border-[#E8E2D9]">
          <div className="h-1 bg-[#E8E2D9] rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-forest rounded-full animate-pulse" />
          </div>
          <p className="text-[10px] text-[#A89F96] mt-1 text-center">Beregner rute…</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 px-3 py-3 border-t border-[#E8E2D9]">
        {waypoints.length >= 2 && (
          <div className="relative">
            {!gpxDialogOpen ? (
              <button
                onClick={openGpxDialog}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#F7F4EF] border border-[#E8E2D9] rounded-lg text-[#6B6560] hover:text-forest hover:border-forest/30 transition-colors"
              >
                <Download size={13} />
                GPX
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={gpxName}
                  onChange={e => setGpxName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { exportGPX(waypoints, legs, gpxName); setGpxDialogOpen(false) }
                    if (e.key === 'Escape') setGpxDialogOpen(false)
                  }}
                  autoFocus
                  placeholder="Filnavn"
                  className="text-xs px-2 py-1 border border-[#E8E2D9] rounded-lg bg-white text-[#1A1A1A] focus:outline-none focus:border-forest w-32"
                />
                <button
                  onClick={() => { exportGPX(waypoints, legs, gpxName); setGpxDialogOpen(false) }}
                  className="text-xs px-2.5 py-1.5 bg-forest text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1"
                >
                  <Download size={12} />
                  Last ned
                </button>
                <button
                  onClick={() => setGpxDialogOpen(false)}
                  className="text-[#A89F96] hover:text-[#1A1A1A] transition-colors"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}
        {waypoints.length > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#F7F4EF] border border-[#E8E2D9] rounded-lg text-[#6B6560] hover:text-red-500 hover:border-red-200 transition-colors ml-auto"
          >
            <RotateCcw size={13} />
            Nullstill
          </button>
        )}
      </div>
    </div>
  )

  const mobileContent = (
    <div className="flex flex-col">
      {/* Kartlag */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E2D9]">
        <p className="text-xs font-semibold text-[#1A1A1A]">Kartlag</p>
        <div className="flex gap-1">
          {(['topo', 'topo2'] as const).map(key => (
            <button
              key={key}
              onClick={() => onLayerChange(key)}
              className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                activeLayer === key
                  ? 'bg-forest text-white'
                  : 'bg-[#F7F4EF] text-[#6B6560] border border-[#E8E2D9]'
              }`}
            >
              {key === 'topo' ? 'Kartverket' : 'OpenTopo'}
            </button>
          ))}
        </div>
      </div>

      {/* Peak height filter */}
      <div className="px-4 py-3 border-b border-[#E8E2D9]">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-[#1A1A1A]">Vis fjelltoppar</p>
          <span className="text-[10px] text-[#A89F96]">{peakCount} av {totalPeakCount}</span>
        </div>
        <div className="relative">
          <select
            value={minHeight}
            onChange={e => onMinHeightChange(e.target.value)}
            className="appearance-none w-full bg-[#F7F4EF] border border-[#E8E2D9] rounded-lg px-3 py-1.5 pr-7 text-xs text-[#1A1A1A] focus:outline-none focus:border-forest transition-colors cursor-pointer"
          >
            {HEIGHT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#A89F96] pointer-events-none" />
        </div>
        <div className="relative mt-1.5">
          <select
            value={minPF}
            onChange={e => onMinPFChange(e.target.value)}
            className="appearance-none w-full bg-[#F7F4EF] border border-[#E8E2D9] rounded-lg px-3 py-1.5 pr-7 text-xs text-[#1A1A1A] focus:outline-none focus:border-forest transition-colors cursor-pointer"
          >
            {PF_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#A89F96] pointer-events-none" />
        </div>
        <p className="text-[10px] text-[#A89F96] mt-1.5">Klikk på en topp for å legge den til</p>
      </div>

      {/* Stats */}
      {waypoints.length >= 2 && (
        <div className="grid grid-cols-2 gap-2 p-3 border-b border-[#E8E2D9]">
          <div className="bg-[#F7F4EF] rounded-lg px-3 py-2 text-center border border-[#E8E2D9]">
            <p className="text-[10px] text-[#6B6560]">Distanse</p>
            <p className="text-sm font-bold text-[#1A1A1A]">{totalDist.toFixed(1)} km</p>
          </div>
          <div className="bg-[#F7F4EF] rounded-lg px-3 py-2 border border-[#E8E2D9]">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] text-[#A89F96] uppercase tracking-wide">Gangtid (bevegelse)</p>
              <div className="space-y-0.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#A89F96]">Naismith</span>
                  <span className="font-medium text-[#1A1A1A]">{formatTime(totalTime.naismith)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A89F96]">Tobler</span>
                  <span className="font-medium text-[#1A1A1A]">{formatTime(totalTime.toblerStd)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#2D5016] font-medium">Kalibrert ↗</span>
                  <span className="font-medium text-[#2D5016]">{formatTime(totalTime.toblerCal)}</span>
                </div>
              </div>
              <p className="text-[10px] text-[#A89F96] mt-1">+ ca. 25–35 % for pauser</p>
            </div>
          </div>
          <div className="bg-[#F7F4EF] rounded-lg px-3 py-2 text-center border border-[#E8E2D9]">
            <p className="text-[10px] text-[#6B6560]">Stigning</p>
            <p className="text-sm font-bold text-[#1A1A1A]">{totalAsc.toLocaleString('no')} m</p>
          </div>
          <div className="bg-[#F7F4EF] rounded-lg px-3 py-2 text-center border border-[#E8E2D9]">
            <p className="text-[10px] text-[#6B6560]">Nedstigning</p>
            <p className="text-sm font-bold text-[#1A1A1A]">{totalDesc.toLocaleString('no')} m</p>
          </div>
        </div>
      )}

      {/* Waypoint list */}
      <div className="px-3 py-2">
        {waypoints.length === 0 ? (
          <p className="text-xs text-[#A89F96] text-center py-8">
            Klikk på kartet eller en topp for å legge til vegpunkter
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {waypoints.map((wp, i) => (
              <div key={wp.id} className="flex items-center gap-2 bg-[#F7F4EF] rounded-lg px-2.5 py-2 border border-[#E8E2D9]">
                <span
                  className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                  style={{ background: i === 0 ? '#2D5016' : i === waypoints.length - 1 ? '#D4A017' : '#E8671A' }}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#1A1A1A] truncate">
                    {wp.label ?? `${wp.lat.toFixed(4)}°, ${wp.lng.toFixed(4)}°`}
                  </p>
                  {i > 0 && legs[i - 1] && (
                    <p className="text-[10px] text-[#6B6560]">
                      {legs[i - 1]!.distanceKm.toFixed(1)} km · +{legs[i - 1]!.ascentM.toLocaleString('no')} m
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => onMoveUp(i)}
                    disabled={i === 0}
                    className="p-0.5 text-[#A89F96] hover:text-[#1A1A1A] disabled:opacity-25 transition-colors"
                  >
                    <ChevronUp size={13} />
                  </button>
                  <button
                    onClick={() => onMoveDown(i)}
                    disabled={i === waypoints.length - 1}
                    className="p-0.5 text-[#A89F96] hover:text-[#1A1A1A] disabled:opacity-25 transition-colors"
                  >
                    <ChevronDown size={13} />
                  </button>
                  {i < waypoints.length - 1 && (
                    <button
                      onClick={() => onToggleLegSnap(i)}
                      title={wp.snapToNext ? 'Følger sti → klikk for rett linje' : 'Rett linje → klikk for rute langs sti'}
                      className={`p-0.5 rounded transition-colors ${
                        wp.snapToNext
                          ? 'text-[#2D5016] bg-[#f0f5e8] border border-[#2D5016]/30'
                          : 'text-[#A89F96] bg-[#F7F4EF] border border-[#E8E2D9]'
                      }`}
                    >
                      {wp.snapToNext ? <Route size={11} /> : <Minus size={11} />}
                    </button>
                  )}
                  <button
                    onClick={() => onRemoveWaypoint(wp.id)}
                    className="p-0.5 text-[#A89F96] hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading bar */}
      {loading && (
        <div className="px-3 py-2 border-t border-[#E8E2D9]">
          <div className="h-1 bg-[#E8E2D9] rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-forest rounded-full animate-pulse" />
          </div>
          <p className="text-[10px] text-[#A89F96] mt-1 text-center">Beregner rute…</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 px-3 py-3 border-t border-[#E8E2D9]">
        {waypoints.length >= 2 && (
          <div className="relative">
            {!gpxDialogOpen ? (
              <button
                onClick={openGpxDialog}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#F7F4EF] border border-[#E8E2D9] rounded-lg text-[#6B6560] hover:text-forest hover:border-forest/30 transition-colors"
              >
                <Download size={13} />
                GPX
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={gpxName}
                  onChange={e => setGpxName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { exportGPX(waypoints, legs, gpxName); setGpxDialogOpen(false) }
                    if (e.key === 'Escape') setGpxDialogOpen(false)
                  }}
                  autoFocus
                  placeholder="Filnavn"
                  className="text-xs px-2 py-1 border border-[#E8E2D9] rounded-lg bg-white text-[#1A1A1A] focus:outline-none focus:border-forest w-32"
                />
                <button
                  onClick={() => { exportGPX(waypoints, legs, gpxName); setGpxDialogOpen(false) }}
                  className="text-xs px-2.5 py-1.5 bg-forest text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1"
                >
                  <Download size={12} />
                  Last ned
                </button>
                <button
                  onClick={() => setGpxDialogOpen(false)}
                  className="text-[#A89F96] hover:text-[#1A1A1A] transition-colors"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}
        {waypoints.length > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#F7F4EF] border border-[#E8E2D9] rounded-lg text-[#6B6560] hover:text-red-500 hover:border-red-200 transition-colors ml-auto"
          >
            <RotateCcw size={13} />
            Nullstill
          </button>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden sm:flex flex-col w-72 shrink-0 bg-white border-r border-[#E8E2D9]" style={{ height: '100%' }}>
        <div className="px-4 py-3 border-b border-[#E8E2D9]">
          <h2 className="text-sm font-bold text-[#1A1A1A]">Turplanlegger</h2>
          <p className="text-[10px] text-[#A89F96] mt-0.5">Høyreklikk på vegpunkt for å slette</p>
        </div>
        {desktopContent}
      </div>

      {/* Mobile bottom drawer */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-[2000]">
        <button
          onClick={() => setDrawerOpen(o => !o)}
          className="w-full flex items-center justify-center gap-2 bg-white border-t border-[#E8E2D9] py-3 text-sm font-medium text-[#1A1A1A] shadow-md"
        >
          {drawerOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          {waypoints.length > 0
            ? `${waypoints.length} vegpunkter · ${totalDist.toFixed(1)} km`
            : '≡ Etapper'}
        </button>
        {drawerOpen && (
          <div className="bg-white border-t border-[#E8E2D9] overflow-y-auto" style={{ height: '55vh' }}>
            {mobileContent}
          </div>
        )}
      </div>
    </>
  )
}
