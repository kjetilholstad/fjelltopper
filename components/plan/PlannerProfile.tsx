'use client'

import type { LegStats } from '@/types/planner'

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
}

export function PlannerProfile({ legs }: PlannerProfileProps) {
  // Build combined elevation points with cumulative distances
  const combined: Array<{ dist: number; elevation: number }> = []
  const legBreakDists: number[] = []
  let cumDist = 0

  for (let i = 0; i < legs.length; i++) {
    const leg = legs[i]
    if (!leg || leg.elevationPoints.length < 2) continue

    const pts = leg.elevationPoints
    const legDist = leg.distanceKm
    const lastDist = pts[pts.length - 1].dist
    const scale = lastDist > 0 ? legDist / lastDist : 1

    if (i > 0 && combined.length > 0) legBreakDists.push(cumDist)

    for (const pt of pts) {
      combined.push({ dist: cumDist + pt.dist * scale, elevation: pt.elevation })
    }
    cumDist += legDist
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

  const W = 800, H = 120
  const PL = 44, PR = 12, PT = 10, PB = 24
  const plotW = W - PL - PR
  const plotH = H - PT - PB

  const toX = (d: number) => PL + (d / totalDist) * plotW
  const toY = (e: number) => PT + plotH - ((e - minE) / paddedRange) * plotH

  const pathD = combined.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${toX(p.dist).toFixed(1)},${toY(p.elevation).toFixed(1)}`
  ).join(' ')
  const fillD = `M ${toX(0).toFixed(1)},${PT + plotH} ${pathD.slice(1)} L ${toX(totalDist).toFixed(1)},${PT + plotH} Z`

  const gridElevs: number[] = []
  for (let e = minE; e <= maxE; e += interval) gridElevs.push(e)

  const tickStep = totalDist <= 3 ? 0.5 : totalDist <= 8 ? 1 : totalDist <= 20 ? 2 : 5
  const distTicks: number[] = []
  for (let d = 0; d <= totalDist + 0.001; d += tickStep) distTicks.push(parseFloat(d.toFixed(1)))

  return (
    <div className="bg-white border-t border-[#E8E2D9] px-2 py-2 shrink-0">
      <svg viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%', height: 120 }} aria-label="Samlet høydeprofil">
        {gridElevs.map(e => {
          const y = toY(e)
          return (
            <g key={e}>
              <line x1={PL} y1={y} x2={W - PR} y2={y}
                stroke={e === minE ? '#C8BFB2' : '#E8E2D9'}
                strokeWidth={e === minE ? 0.8 : 0.6}
                strokeDasharray={e === minE ? undefined : '4 3'}
              />
              <text x={PL - 4} y={y + 3.5} fontSize="8" fill="#A89F96" textAnchor="end" fontFamily="system-ui,sans-serif">
                {e.toLocaleString('no')}
              </text>
            </g>
          )
        })}

        <path d={fillD} fill="#E8E2D9" />
        <path d={pathD} fill="none" stroke="#8B7355" strokeWidth={1.5} />

        {/* Waypoint leg breaks */}
        {legBreakDists.map((d, i) => (
          <line key={i} x1={toX(d)} y1={PT} x2={toX(d)} y2={PT + plotH}
            stroke="#E8671A" strokeWidth={1} strokeDasharray="3 3" opacity={0.7} />
        ))}

        {/* Start / end dots */}
        <circle cx={toX(0)} cy={toY(elevs[0])} r={4} fill="#2D5016" stroke="white" strokeWidth={1.5} />
        <circle cx={toX(totalDist)} cy={toY(elevs[elevs.length - 1])} r={4} fill="#D4A017" stroke="white" strokeWidth={1.5} />

        {/* Distance ticks */}
        {distTicks.map(d => (
          <g key={d}>
            <line x1={toX(d)} y1={PT + plotH} x2={toX(d)} y2={PT + plotH + 4} stroke="#C8BFB2" strokeWidth={0.8} />
            <text x={toX(d)} y={PT + plotH + 14} fontSize="8" fill="#A89F96" textAnchor="middle" fontFamily="system-ui,sans-serif">
              {d % 1 === 0 ? d : d.toFixed(1)}
            </text>
          </g>
        ))}

        <text x={W / 2} y={H - 1} fontSize="8" fill="#A89F96" textAnchor="middle" fontFamily="system-ui,sans-serif">
          Avstand (km)
        </text>
      </svg>
    </div>
  )
}
