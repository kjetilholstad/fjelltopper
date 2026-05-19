'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, Trash2, Download, RotateCcw } from 'lucide-react'
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

function formatTime(hours: number): string {
  if (hours === 0) return '0 min'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0) return `${m} min`
  return m > 0 ? `${h}t ${m}min` : `${h}t`
}

function exportGPX(waypoints: Waypoint[], legs: (LegStats | null)[]) {
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
    `  <trk><name>Turplan</name><trkseg>` +
    trackpts.join('') +
    `\n  </trkseg></trk>\n</gpx>`

  const blob = new Blob([gpx], { type: 'application/gpx+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'turplan.gpx'; a.click()
  URL.revokeObjectURL(url)
}

interface PlannerPanelProps {
  waypoints: Waypoint[]
  legs: (LegStats | null)[]
  snapEnabled: boolean
  minHeight: string
  minPF: string
  loading: boolean
  creditExhausted: boolean
  peakCount: number
  totalPeakCount: number
  onSnapToggle: () => void
  onMinHeightChange: (v: string) => void
  onMinPFChange: (v: string) => void
  onRemoveWaypoint: (id: string) => void
  onClearAll: () => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
}

export function PlannerPanel({
  waypoints, legs, snapEnabled, minHeight, minPF, loading, creditExhausted,
  peakCount, totalPeakCount,
  onSnapToggle, onMinHeightChange, onMinPFChange, onRemoveWaypoint, onClearAll, onMoveUp, onMoveDown,
}: PlannerPanelProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const totalDist  = legs.reduce((s, l) => s + (l?.distanceKm ?? 0), 0)
  const totalAsc   = legs.reduce((s, l) => s + (l?.ascentM   ?? 0), 0)
  const totalDesc  = legs.reduce((s, l) => s + (l?.descentM  ?? 0), 0)
  const totalHours = legs.reduce((s, l) => s + (l?.estimatedHours ?? 0), 0)

  const content = (
    <div className="flex flex-col h-full overflow-hidden">
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

      {/* Snap toggle */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E2D9]">
        <div>
          <p className="text-xs font-semibold text-[#1A1A1A]">Rute langs stier</p>
          <p className="text-[10px] text-[#A89F96]">GraphHopper · krever nett</p>
        </div>
        <button
          onClick={onSnapToggle}
          className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
            snapEnabled
              ? 'bg-forest text-white'
              : 'bg-[#F7F4EF] text-[#6B6560] border border-[#E8E2D9]'
          }`}
        >
          {snapEnabled ? 'På' : 'Av'}
        </button>
      </div>

      {creditExhausted && (
        <div className="mx-3 mt-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          GraphHopper-kvota er tom. Bruker luftlinje.
        </div>
      )}

      {/* Stats */}
      {waypoints.length >= 2 && (
        <div className="grid grid-cols-2 gap-2 p-3 border-b border-[#E8E2D9]">
          {[
            { label: 'Distanse',    value: `${totalDist.toFixed(1)} km` },
            { label: 'Gangtid',     value: formatTime(totalHours) },
            { label: 'Stigning',    value: `${totalAsc.toLocaleString('no')} m` },
            { label: 'Nedstigning', value: `${totalDesc.toLocaleString('no')} m` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#F7F4EF] rounded-lg px-3 py-2 text-center border border-[#E8E2D9]">
              <p className="text-[10px] text-[#6B6560]">{label}</p>
              <p className="text-sm font-bold text-[#1A1A1A]">{value}</p>
            </div>
          ))}
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
          <button
            onClick={() => exportGPX(waypoints, legs)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#F7F4EF] border border-[#E8E2D9] rounded-lg text-[#6B6560] hover:text-forest hover:border-forest/30 transition-colors"
          >
            <Download size={13} />
            GPX
          </button>
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
        {content}
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
          <div className="bg-white border-t border-[#E8E2D9] flex flex-col" style={{ maxHeight: '55vh' }}>
            {content}
          </div>
        )}
      </div>
    </>
  )
}
