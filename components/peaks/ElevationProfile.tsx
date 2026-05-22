'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { fetchElevationProfile, calcProfileStats, ProfileStats } from '@/lib/elevationProfile'

interface Props {
  fromName: string
  toName: string
  fromLat: number
  fromLng: number
  toLat: number
  toLng: number
  onClose: () => void
}

function niceInterval(range: number): number {
  if (range <= 150)  return 25
  if (range <= 400)  return 50
  if (range <= 900)  return 100
  if (range <= 2000) return 200
  return 500
}

interface SVGData {
  points: Array<{ elevation: number }>
  distanceKm: number
}

function ProfileSVG({ data, compact }: { data: SVGData; compact: boolean }) {
  const { points, distanceKm } = data
  const elevs = points.map(p => p.elevation)
  const rawMin = Math.min(...elevs), rawMax = Math.max(...elevs)
  const range = rawMax - rawMin || 100
  const interval = niceInterval(range)
  const minE = Math.floor(rawMin / interval) * interval
  const maxE = Math.ceil(rawMax  / interval) * interval
  const paddedRange = maxE - minE || interval

  const PL = compact ? 8  : 46
  const PR = compact ? 8  : 12
  const PT = compact ? 8  : 18
  const PB = compact ? 8  : 26
  const W  = compact ? 440 : 580
  const H  = compact ? 100 : 220

  const plotW = W - PL - PR
  const plotH = H - PT - PB

  const toX = (i: number) => PL + (i / (points.length - 1)) * plotW
  const toY = (e: number) => PT + plotH - ((e - minE) / paddedRange) * plotH

  const pathD = points.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)},${toY(p.elevation).toFixed(1)}`
  ).join(' ')
  const fillD = `M ${toX(0).toFixed(1)},${PT + plotH} ${pathD.slice(1)} L ${toX(points.length - 1).toFixed(1)},${PT + plotH} Z`

  // Elevation grid lines
  const gridElevs: number[] = []
  for (let e = minE; e <= maxE; e += interval) gridElevs.push(e)

  // Distance tick marks (full view only)
  const distTicks: number[] = []
  if (!compact && distanceKm > 0) {
    const tickStep = distanceKm <= 3 ? 0.5 : distanceKm <= 8 ? 1 : distanceKm <= 20 ? 2 : 5
    for (let d = 0; d <= distanceKm + 0.001; d += tickStep) distTicks.push(parseFloat(d.toFixed(1)))
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Høydeprofil">
      {/* Elevation grid lines */}
      {gridElevs.map(e => {
        const y = toY(e)
        const isBase = e === minE
        return (
          <g key={e}>
            <line
              x1={PL} y1={y} x2={W - PR} y2={y}
              stroke={isBase ? '#C8BFB2' : '#E8E2D9'}
              strokeWidth={isBase ? 0.8 : 0.6}
              strokeDasharray={isBase ? undefined : '4 3'}
            />
            {!compact && (
              <text x={PL - 4} y={y + 3.5} fontSize="9" fill="#A89F96" textAnchor="end" fontFamily="system-ui, sans-serif">
                {e.toLocaleString('no')}
              </text>
            )}
          </g>
        )
      })}

      {/* Terrain fill + profile line */}
      <path d={fillD} fill="#E8E2D9" />
      <path d={pathD} fill="none" stroke="#8B7355" strokeWidth={compact ? 1.5 : 1.8} />

      {/* Start/end markers */}
      <circle cx={toX(0)} cy={toY(elevs[0])} r={compact ? 4 : 5} fill="#2D5016" stroke="white" strokeWidth={compact ? 1.5 : 2} />
      <circle cx={toX(points.length - 1)} cy={toY(elevs[elevs.length - 1])} r={compact ? 4 : 5} fill="#2D5016" stroke="white" strokeWidth={compact ? 1.5 : 2} />

      {/* Start/end elevation labels (full view only) */}
      {!compact && (
        <>
          <text
            x={toX(0)} y={toY(elevs[0]) - 9}
            fontSize="9.5" fill="#2D5016" fontWeight="700"
            textAnchor="start" fontFamily="system-ui, sans-serif"
          >
            {Math.round(elevs[0]).toLocaleString('no')} m
          </text>
          <text
            x={toX(points.length - 1)} y={toY(elevs[elevs.length - 1]) - 9}
            fontSize="9.5" fill="#2D5016" fontWeight="700"
            textAnchor="end" fontFamily="system-ui, sans-serif"
          >
            {Math.round(elevs[elevs.length - 1]).toLocaleString('no')} m
          </text>
        </>
      )}

      {/* Compact: min/max labels */}
      {compact && (
        <>
          <text x={PL} y={PT + 8} fontSize="7" fill="#A89F96" fontFamily="system-ui">{Math.round(rawMax)} m</text>
          <text x={PL} y={H - 2} fontSize="7" fill="#A89F96" fontFamily="system-ui">{Math.round(rawMin)} m</text>
        </>
      )}

      {/* Full: X-axis distance ticks */}
      {!compact && distTicks.map(d => {
        const x = PL + (d / distanceKm) * plotW
        return (
          <g key={d}>
            <line x1={x} y1={PT + plotH} x2={x} y2={PT + plotH + 4} stroke="#C8BFB2" strokeWidth="0.8" />
            <text x={x} y={PT + plotH + 14} fontSize="8.5" fill="#A89F96" textAnchor="middle" fontFamily="system-ui, sans-serif">
              {d % 1 === 0 ? d : d.toFixed(1)}
            </text>
          </g>
        )
      })}

      {/* Full: axis labels */}
      {!compact && (
        <>
          <text x={W / 2} y={H - 1} fontSize="8.5" fill="#A89F96" textAnchor="middle" fontFamily="system-ui, sans-serif">
            Avstand (km)
          </text>
          <text
            x={10} y={PT + plotH / 2}
            fontSize="8.5" fill="#A89F96" textAnchor="middle" fontFamily="system-ui, sans-serif"
            transform={`rotate(-90, 10, ${PT + plotH / 2})`}
          >
            Høyde (m)
          </text>
        </>
      )}
    </svg>
  )
}

export default function ElevationProfile({ fromName, toName, fromLat, fromLng, toLat, toLng, onClose }: Props) {
  const [points, setPoints]   = useState<Array<{ elevation: number }>>([])
  const [stats, setStats]     = useState<ProfileStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    setLoading(true); setError(false); setPoints([]); setStats(null)
    fetchElevationProfile(fromLat, fromLng, toLat, toLng, 50)
      .then(({ points: pts, distanceKm }) => {
        setPoints(pts)
        setStats(calcProfileStats(pts, distanceKm))
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [fromLat, fromLng, toLat, toLng])

  const formatTime = (h: number) => {
    const hh = Math.floor(h), mm = Math.round((h - hh) * 60)
    return hh > 0 ? `${hh}t ${mm}min` : `${mm}min`
  }

  const svgData = points.length && stats ? { points, distanceKm: stats.distanceKm } : null

  const chips: Array<{ label: string; value: string; highlight?: boolean }> = stats ? [
    { label: 'Luftlinje',   value: `${stats.distanceKm.toFixed(1)} km` },
    { label: 'Stigning',    value: `${stats.ascentM} m` },
    { label: 'Nedstigning', value: `${stats.descentM} m` },
    { label: 'Naismith',    value: formatTime(stats.timeEstimates.naismith) },
    { label: 'Tobler',      value: formatTime(stats.timeEstimates.toblerStd) },
    { label: 'Kalibrert ↗', value: formatTime(stats.timeEstimates.toblerCal), highlight: true },
  ] : []

  return (
    <>
      {/* Kompakt panel */}
      <div className="bg-white rounded-xl border border-[#E8E2D9] shadow-md p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-[#1A1A1A] truncate pr-2">
            {fromName} → {toName}
          </p>
          <button onClick={onClose} className="text-[#A89F96] hover:text-[#6B6560] text-xs shrink-0">✕</button>
        </div>

        {loading && <div className="h-24 bg-[#F7F4EF] rounded-lg animate-pulse mb-3" />}
        {error   && <p className="text-xs text-[#A89F96] text-center py-4">Kunne ikke hente høydedata</p>}

        {!loading && !error && svgData && (
          <>
            <button
              onClick={() => setExpanded(true)}
              className="w-full mb-3 rounded-lg overflow-hidden hover:opacity-80 transition-opacity cursor-zoom-in"
              title="Åpne detaljert profil"
            >
              <ProfileSVG data={svgData} compact />
            </button>
            <div className="grid grid-cols-3 gap-2">
              {chips.map(({ label, value, highlight }) => (
                <div key={label} className="bg-[#F7F4EF] rounded-lg px-3 py-2 text-center border border-[#E8E2D9]">
                  <p className="text-[10px] text-[#6B6560]">{label}</p>
                  <p className={`text-sm font-semibold ${highlight ? 'text-[#2D5016]' : 'text-[#1A1A1A]'}`}>{value}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-[#A89F96] mt-2 text-center">
              Bevegelsestid · Kalibrert Tobler anbefalt · +25–35 % for pauser · Kartverket høydedata
            </p>
          </>
        )}
      </div>

      {/* Utvidet modal — rendret via portal utenfor transformert container */}
      {expanded && svgData && createPortal(
        <div
          className="fixed inset-0 z-[3000] flex flex-col"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setExpanded(false)}
          onTouchEnd={(e) => { e.preventDefault(); setExpanded(false) }}
        >
          <div
            className="mt-auto bg-white border-t border-[#E8E2D9] w-full"
            style={{ maxHeight: '70vh', padding: '16px 16px 10px', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
            onTouchEnd={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-[#1A1A1A] text-sm truncate pr-4">
                {fromName} → {toName}
              </p>
              <button
                onClick={() => setExpanded(false)}
                className="text-[#A89F96] hover:text-[#1A1A1A] text-lg leading-none shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <ProfileSVG data={svgData} compact={false} />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {chips.map(({ label, value, highlight }) => (
                <div key={label} className="bg-[#F7F4EF] rounded-xl px-3 py-3 text-center border border-[#E8E2D9]">
                  <p className="text-[10px] text-[#6B6560] mb-0.5">{label}</p>
                  <p className={`text-sm font-bold ${highlight ? 'text-[#2D5016]' : 'text-[#1A1A1A]'}`}>{value}</p>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-[#A89F96] mt-3 text-center">
              Bevegelsestid · Kalibrert Tobler anbefalt · +25–35 % for pauser · Kartverket høydedata
            </p>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
