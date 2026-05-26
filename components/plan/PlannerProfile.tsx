'use client'

import { useState, useEffect } from 'react'
import { Maximize2, X } from 'lucide-react'
import { haversineKm } from '@/lib/nearestPeaks'
import type { LegStats } from '@/types/planner'
import type { Peak } from '@/types'

function niceInterval(range: number): number {
  if (range <= 150)  return 25
  if (range <= 400)  return 50
  if (range <= 900)  return 100
  if (range <= 2000) return 200
  return 500
}

interface PlannerProfileProps {
  legs: (LegStats | null)[]
  waypointLabels: string[]
  peaks: Peak[]
  expanded: boolean
  onExpandChange: (v: boolean) => void
}

export function PlannerProfile({ legs, waypointLabels, peaks, expanded, onExpandChange }: PlannerProfileProps) {
  const [isLandscape, setIsLandscape] = useState(false)
  useEffect(() => {
    const check = () => setIsLandscape(window.innerHeight < 500)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Build combined elevation points with cumulative distances
  const combined: Array<{ dist: number; elevation: number }> = []
  const legBreakDists: number[] = []
  const waypointCumDists: number[] = [0]
  let cumDist = 0

  for (let i = 0; i < legs.length; i++) {
    const leg = legs[i]
    if (!leg || leg.elevationPoints.length < 2) {
      waypointCumDists.push(cumDist)
      continue
    }
    const pts = leg.elevationPoints
    const legDist = leg.distanceKm
    const lastDist = pts[pts.length - 1].dist
    const scale = lastDist > 0 ? legDist / lastDist : 1
    if (i > 0 && combined.length > 0) legBreakDists.push(cumDist)
    for (const pt of pts) {
      combined.push({ dist: cumDist + pt.dist * scale, elevation: pt.elevation })
    }
    cumDist += legDist
    waypointCumDists.push(cumDist)
  }

  if (combined.length < 2) return null

  const elevs = combined.map(p => p.elevation)
  const totalDist = combined[combined.length - 1].dist
  const rawMin = Math.min(...elevs)
  const rawMax = Math.max(...elevs)
  const range = rawMax - rawMin || 100
  const interval = niceInterval(range)
  const minE = Math.floor(rawMin / interval) * interval
  const maxE = Math.ceil(rawMax  / interval) * interval
  const paddedRange = maxE - minE || interval

  const gridElevs: number[] = []
  for (let el = minE; el <= maxE; el += interval) gridElevs.push(el)

  const tickStep = totalDist <= 3 ? 0.5 : totalDist <= 8 ? 1 : totalDist <= 20 ? 2 : 5
  const distTicks: number[] = []
  for (let d = 0; d <= totalDist + 0.001; d += tickStep) distTicks.push(parseFloat(d.toFixed(1)))

  // Build geometry-based points for peak proximity detection
  type GeoPoint = { lat: number; lng: number; dist: number; elevation: number }
  const geoPoints: GeoPoint[] = []
  let geoCumDist = 0

  for (let i = 0; i < legs.length; i++) {
    const leg = legs[i]
    if (!leg || leg.geometry.length < 2) continue
    const pts = leg.elevationPoints
    leg.geometry.forEach(([lat, lng], gi) => {
      if (gi > 0) {
        const [prevLat, prevLng] = leg.geometry[gi - 1]
        geoCumDist += haversineKm(prevLat, prevLng, lat, lng)
      }
      const elev = pts[gi]?.elevation ?? pts[pts.length - 1]?.elevation ?? 0
      geoPoints.push({ lat, lng, dist: geoCumDist, elevation: elev })
    })
  }

  // Find peaks within 300 m of the route
  const PEAK_SNAP_KM = 0.3
  const peaksOnRoute: Array<{ name: string; height: number; dist: number; elevation: number }> = []

  for (const peak of peaks) {
    if (!peak.lat || !peak.lng) continue
    let minDist = Infinity
    let closest: GeoPoint | null = null
    for (const gp of geoPoints) {
      const d = haversineKm(peak.lat, peak.lng, gp.lat, gp.lng)
      if (d < minDist) { minDist = d; closest = gp }
    }
    if (closest && minDist < PEAK_SNAP_KM) {
      const alreadyAdded = peaksOnRoute.some(p => Math.abs(p.dist - closest!.dist) < 0.1)
      if (!alreadyAdded) {
        peaksOnRoute.push({ name: peak.name, height: peak.height, dist: closest.dist, elevation: peak.height })
      }
    }
  }

  // SVG dimension helpers
  function mkH(W: number, H: number, PL: number, PR: number, PT: number, PB: number) {
    const plotW = W - PL - PR
    const plotH = H - PT - PB
    const toX = (d: number) => PL + (d / totalDist) * plotW
    const toY = (el: number) => PT + plotH - ((el - minE) / paddedRange) * plotH
    return { W, H, PL, PR, PT, PB, plotW, plotH, toX, toY }
  }

  function elevAtDist(d: number): number {
    let best = combined[0]
    let minDiff = Infinity
    for (const pt of combined) {
      const diff = Math.abs(pt.dist - d)
      if (diff < minDiff) { minDiff = diff; best = pt }
    }
    return best.elevation
  }

  const cm = mkH(800, 120, 44, 12, 10, 24)
  const xp = mkH(1000, 240, 52, 16, 30, 50)

  const compactPath = combined.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${cm.toX(p.dist).toFixed(1)},${cm.toY(p.elevation).toFixed(1)}`
  ).join(' ')
  const compactFill = `M ${cm.toX(0).toFixed(1)},${cm.PT + cm.plotH} ${compactPath.slice(1)} L ${cm.toX(totalDist).toFixed(1)},${cm.PT + cm.plotH} Z`

  const expandPath = combined.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${xp.toX(p.dist).toFixed(1)},${xp.toY(p.elevation).toFixed(1)}`
  ).join(' ')
  const expandFill = `M ${xp.toX(0).toFixed(1)},${xp.PT + xp.plotH} ${expandPath.slice(1)} L ${xp.toX(totalDist).toFixed(1)},${xp.PT + xp.plotH} Z`

  // ── Color per waypoint index ──
  const peakNameSet = new Set(peaksOnRoute.map(p => p.name))

  function wpColor(idx: number): string {
    if (idx === 0 || idx === waypointLabels.length - 1) return '#2D5016'
    return peakNameSet.has(waypointLabels[idx] ?? '') ? '#3B74B8' : '#E8671A'
  }

  // ── Waypoint elevations (start + breaks + end) ──
  const waypointElevs: number[] = waypointCumDists.map(d => Math.round(elevAtDist(d)))

  // ── Legend label per waypoint ──
  function legendLabel(wpLabel: string, idx: number): string {
    if (idx === 0) return 'Startpunkt'
    if (idx === waypointLabels.length - 1) return 'Sluttunkt'
    return peakNameSet.has(wpLabel) ? wpLabel : `Punkt ${idx + 1}`
  }

  return (
    <>
      {/* Compact strip */}
      <div className="bg-white border-t border-[#E8E2D9] px-2 py-2 shrink-0 relative">
        <button
          onClick={() => onExpandChange(true)}
          title="Vis stor høydeprofil"
          className="absolute top-2 right-2 p-1 text-[#A89F96] hover:text-[#1A1A1A] transition-colors z-10"
        >
          <Maximize2 size={13} />
        </button>

        <svg viewBox="0 0 800 120" style={{ display: 'block', width: '100%', height: 120 }} aria-label="Samlet høydeprofil">
          <path d={compactFill} fill="#E8E2D9" />
          <path d={compactPath} fill="none" stroke="#8B7355" strokeWidth={1.5} />

          {gridElevs.map(el => {
            const y = cm.toY(el)
            return (
              <g key={el}>
                <line x1={cm.PL} y1={y} x2={cm.W - cm.PR} y2={y}
                  stroke={el === minE ? '#C8BFB2' : '#C4BDB5'}
                  strokeWidth={el === minE ? 0.8 : 0.6}
                  strokeDasharray={el === minE ? undefined : '4 3'}
                />
                <text x={cm.PL - 4} y={y + 3.5} fontSize="8" fill="#A89F96" textAnchor="end" fontFamily="system-ui,sans-serif">
                  {el.toLocaleString('no')}
                </text>
              </g>
            )
          })}

          {legBreakDists.map((d, i) => (
            <line key={i} x1={cm.toX(d)} y1={cm.PT} x2={cm.toX(d)} y2={cm.PT + cm.plotH}
              stroke="#E8671A" strokeWidth={1} strokeDasharray="3 3" opacity={0.7} />
          ))}

          <circle cx={cm.toX(0)} cy={cm.toY(elevs[0])} r={4} fill="#2D5016" stroke="white" strokeWidth={1.5} />
          <circle cx={cm.toX(totalDist)} cy={cm.toY(elevs[elevs.length - 1])} r={4} fill="#D4A017" stroke="white" strokeWidth={1.5} />

          {distTicks.map(d => (
            <g key={d}>
              <line x1={cm.toX(d)} y1={cm.PT + cm.plotH} x2={cm.toX(d)} y2={cm.PT + cm.plotH + 4} stroke="#C8BFB2" strokeWidth={0.8} />
              <text x={cm.toX(d)} y={cm.PT + cm.plotH + 14} fontSize="8" fill="#A89F96" textAnchor="middle" fontFamily="system-ui,sans-serif">
                {d % 1 === 0 ? d : d.toFixed(1)}
              </text>
            </g>
          ))}

          <text x={cm.W / 2} y={cm.H - 1} fontSize="8" fill="#A89F96" textAnchor="middle" fontFamily="system-ui,sans-serif">
            Avstand (km)
          </text>
        </svg>
      </div>

      {/* Expanded modal */}
      {expanded && (
        <div
          className="fixed inset-0 z-[3000] flex flex-col"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => onExpandChange(false)}
          onTouchEnd={(e) => { e.preventDefault(); onExpandChange(false) }}
        >
          <div
            className="mt-auto bg-white border-t border-[#E8E2D9] w-full"
            style={{ maxHeight: '70vh', padding: '16px 16px 10px', overflowY: 'auto' }}
            onClick={ev => ev.stopPropagation()}
            onTouchEnd={ev => ev.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-[#1A1A1A]">Høydeprofil</p>
              <button onClick={() => onExpandChange(false)} className="text-[#A89F96] hover:text-[#1A1A1A] transition-colors">
                <X size={16} />
              </button>
            </div>

            <svg
              viewBox="0 0 1000 240"
              style={{ display: 'block', width: '100%', height: 'auto', maxHeight: isLandscape ? '20vh' : '28vh' }}
              aria-label="Høydeprofil"
            >
              {/* 3. Fill + 3b. Over-2000m shading + 4. Profile curve */}
              <path d={expandFill} fill="#E8E2D9" />
              {rawMax > 2000 && (() => {
                const clipH = Math.max(0, xp.toY(2000) - xp.PT)
                return (
                  <>
                    <defs>
                      <clipPath id="clip-above2000">
                        <rect x={xp.PL} y={xp.PT} width={xp.plotW} height={clipH} />
                      </clipPath>
                    </defs>
                    <path d={expandFill} fill="#D0CABB" clipPath="url(#clip-above2000)" />
                  </>
                )
              })()}
              <path d={expandPath} fill="none" stroke="#8B7355" strokeWidth={1.5} />

              {/* 2. Km grid lines (vertical, on top of fill) */}
              {distTicks.filter(d => d > 0 && d < totalDist).map(d => (
                <line key={`vgrid-${d}`}
                  x1={xp.toX(d)} y1={xp.PT}
                  x2={xp.toX(d)} y2={xp.PT + xp.plotH}
                  stroke="#C4BDB5" strokeWidth={0.7} strokeDasharray="3 3"
                />
              ))}

              {/* 1. Y-axis grid lines (on top of fill) */}
              {gridElevs.map(el => {
                const y = xp.toY(el)
                return (
                  <g key={el}>
                    <line x1={xp.PL} y1={y} x2={xp.W - 2} y2={y}
                      stroke={el === minE ? '#C8BFB2' : '#C4BDB5'}
                      strokeWidth={el === minE ? 0.8 : 0.6}
                      strokeDasharray={el === minE ? undefined : '4 3'}
                    />
                    <text x={xp.PL - 4} y={y + 3.5} fontSize="9" fill="#A89F96" textAnchor="end" fontFamily="system-ui,sans-serif">
                      {el.toLocaleString('no')}
                    </text>
                  </g>
                )
              })}

              {/* 5. Leg-break lines + dots */}
              {legBreakDists.map((d, i) => {
                const elev  = Math.round(elevAtDist(d))
                const x     = xp.toX(d)
                const py    = xp.toY(elev)
                const color = wpColor(i + 1)
                return (
                  <g key={i}>
                    <line x1={x} y1={py} x2={x} y2={xp.PT + xp.plotH}
                      stroke={color} strokeWidth={1.2} strokeDasharray="4 3" opacity={0.85} />
                    <circle cx={x} cy={py} r={3} fill={color} stroke="white" strokeWidth={1.5} />
                  </g>
                )
              })}

              {/* 6. Peaks — fjernet (vises i legend) */}

              {/* 7. Start/end dots */}
              <circle cx={xp.toX(0)}         cy={xp.toY(elevs[0])}                r={5} fill="#2D5016" stroke="white" strokeWidth={2} />
              <circle cx={xp.toX(totalDist)} cy={xp.toY(elevs[elevs.length - 1])} r={5} fill="#2D5016" stroke="white" strokeWidth={2} />

              {/* 8. Distance ticks */}
              {distTicks.map(d => (
                <g key={d}>
                  <line x1={xp.toX(d)} y1={xp.PT + xp.plotH} x2={xp.toX(d)} y2={xp.PT + xp.plotH + 4} stroke="#C8BFB2" strokeWidth={0.8} />
                  <text x={xp.toX(d)} y={xp.PT + xp.plotH + 14} fontSize="8.5" fill="#A89F96" textAnchor="middle" fontFamily="system-ui,sans-serif">
                    {d % 1 === 0 ? d : d.toFixed(1)}
                  </text>
                </g>
              ))}

              {/* 9. Waypoint badges below x-axis */}
              {[xp.toX(0), ...legBreakDists.map(d => xp.toX(d)), xp.toX(totalDist)].map((x, i) => {
                const color = wpColor(i)
                const cy    = xp.PT + xp.plotH + 22
                return (
                  <g key={`wp-badge-${i}`}>
                    <circle cx={x} cy={cy} r={7} fill={color} stroke="white" strokeWidth={1.5} />
                    <text x={x} y={cy + 2.8}
                      fontSize="7" fill="white" textAnchor="middle"
                      fontFamily="system-ui,sans-serif" fontWeight="700">
                      {i + 1}
                    </text>
                  </g>
                )
              })}

              {/* 12. Axis label */}
              <text x={xp.W / 2} y={xp.H - 4} fontSize="9" fill="#A89F96" textAnchor="middle" fontFamily="system-ui,sans-serif">
                Avstand (km)
              </text>
            </svg>

            {/* Legend */}
            <div className="mt-3 pt-2.5 border-t border-[#F0EBE3]">
              <div className="grid grid-cols-3 gap-x-3 gap-y-1">
                {waypointLabels.map((wpLabel, i) => {
                  const color = wpColor(i)
                  const name  = legendLabel(wpLabel, i)
                  const elev  = waypointElevs[i]
                  return (
                    <div key={i} className="flex items-center gap-1.5 min-w-0">
                      <div
                        className="shrink-0 flex items-center justify-center rounded-full text-white font-bold"
                        style={{ width: 17, height: 17, fontSize: 8, background: color }}
                      >
                        {i + 1}
                      </div>
                      <span className="truncate leading-tight" style={{ fontSize: 10, color: '#1A1A1A', fontWeight: 500 }}>
                        {name}
                      </span>
                      <span className="shrink-0 leading-tight" style={{ fontSize: 10, color: '#A89F96' }}>
                        {elev.toLocaleString('no')}&nbsp;moh
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
