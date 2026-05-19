'use client'

import { useEffect, useState } from 'react'
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

export default function ElevationProfile({ fromName, toName, fromLat, fromLng, toLat, toLng, onClose }: Props) {
  const [points, setPoints]   = useState<Array<{ elevation: number }>>([])
  const [stats, setStats]     = useState<ProfileStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

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

  const renderSVG = () => {
    if (!points.length) return null
    const elevs = points.map(p => p.elevation)
    const minE = Math.min(...elevs), maxE = Math.max(...elevs)
    const range = maxE - minE || 1
    const W = 440, H = 100, PAD = 8

    const toX = (i: number) => PAD + (i / (points.length - 1)) * (W - PAD * 2)
    const toY = (e: number) => H - PAD - ((e - minE) / range) * (H - PAD * 2)

    const pathD = points.map((p, i) =>
      `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)},${toY(p.elevation).toFixed(1)}`
    ).join(' ')

    const fillD = `M ${toX(0).toFixed(1)},${H} ${pathD.slice(1)} L ${toX(points.length - 1).toFixed(1)},${H} Z`

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Høydeprofil">
        <path d={fillD} fill="#E8E2D9" />
        <path d={pathD} fill="none" stroke="#C8BFB2" strokeWidth="1.5" />
        <circle cx={toX(0)} cy={toY(elevs[0])} r="4" fill="#2D5016" stroke="white" strokeWidth="1.5" />
        <circle cx={toX(points.length - 1)} cy={toY(elevs[elevs.length - 1])} r="4" fill="#2D5016" stroke="white" strokeWidth="1.5" />
        <text x={PAD} y={PAD + 8} fontSize="7" fill="#A89F96" fontFamily="system-ui">{Math.round(maxE)} m</text>
        <text x={PAD} y={H - 2} fontSize="7" fill="#A89F96" fontFamily="system-ui">{Math.round(minE)} m</text>
      </svg>
    )
  }

  const formatTime = (h: number) => {
    const hh = Math.floor(h), mm = Math.round((h - hh) * 60)
    return hh > 0 ? `${hh}t ${mm}min` : `${mm}min`
  }

  return (
    <div className="bg-white rounded-xl border border-[#E8E2D9] shadow-md p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-[#1A1A1A] truncate pr-2">
          {fromName} → {toName}
        </p>
        <button onClick={onClose} className="text-[#A89F96] hover:text-[#6B6560] text-xs shrink-0">✕</button>
      </div>

      {loading && (
        <div className="h-24 bg-[#F7F4EF] rounded-lg animate-pulse mb-3" />
      )}
      {error && (
        <p className="text-xs text-[#A89F96] text-center py-4">Kunne ikke hente høydedata</p>
      )}
      {!loading && !error && (
        <>
          <div className="mb-3">{renderSVG()}</div>
          {stats && (
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Luftlinje',   value: `${stats.distanceKm.toFixed(1)} km` },
                { label: 'Stigning',    value: `${stats.ascentM} m` },
                { label: 'Nedstigning', value: `${stats.descentM} m` },
                { label: 'Gangtid',     value: formatTime(stats.estimatedHours) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#F7F4EF] rounded-lg px-3 py-2 text-center border border-[#E8E2D9]">
                  <p className="text-[10px] text-[#6B6560]">{label}</p>
                  <p className="text-sm font-semibold text-[#1A1A1A]">{value}</p>
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] text-[#A89F96] mt-2 text-center">
            Gangtid per Naismiths regel · Kartverket høydedata
          </p>
        </>
      )}
    </div>
  )
}
