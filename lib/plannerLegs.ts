import { fetchElevationProfile, calcProfileStats } from './elevationProfile'
import { fetchSnapRoute, CreditExhaustedError, RateLimitedError } from './graphhopper'
import { haversineKm } from './nearestPeaks'
import type { SnapRouteResult } from './graphhopper'
import type { Waypoint, LegStats } from '@/types/planner'

export { CreditExhaustedError, RateLimitedError }

const SNAP_THRESHOLD_KM = 0.05

const sleep = (ms: number) => new Promise<void>(res => setTimeout(res, ms))

function toblerTime(
  points: Array<{ dist: number; elevation: number }>,
  totalKm: number,
  A: number, B: number, C: number
): number {
  if (points.length < 2) return totalKm / (A * Math.exp(-B * Math.abs(C)))
  const scale = points[points.length - 1].dist > 0
    ? totalKm / points[points.length - 1].dist : 1
  let h = 0
  for (let i = 1; i < points.length; i++) {
    const dDist = (points[i].dist - points[i - 1].dist) * scale
    const dElev = points[i].elevation - points[i - 1].elevation
    if (dDist <= 0) continue
    const s = (dElev / 1000) / dDist
    h += dDist / (A * Math.exp(-B * Math.abs(s + C)))
  }
  return h
}

function buildSnapLeg(result: SnapRouteResult, from: Waypoint, to: Waypoint): LegStats {
  const startOffsetKm = haversineKm(from.lat, from.lng, result.snappedFrom[0], result.snappedFrom[1])
  const endOffsetKm   = haversineKm(to.lat, to.lng, result.snappedTo[0], result.snappedTo[1])

  const offTrailStart: [number, number][] | undefined = startOffsetKm > SNAP_THRESHOLD_KM
    ? [[from.lat, from.lng], result.snappedFrom]
    : undefined

  const offTrailEnd: [number, number][] | undefined = endOffsetKm > SNAP_THRESHOLD_KM
    ? [result.snappedTo, [to.lat, to.lng]]
    : undefined

  const fullGeometry: [number, number][] = [
    ...(offTrailStart ? [[from.lat, from.lng] as [number, number]] : []),
    ...result.geometry,
    ...(offTrailEnd   ? [[to.lat, to.lng] as [number, number]]   : []),
  ]

  return {
    distanceKm: result.distanceKm,
    ascentM: result.ascentM,
    descentM: result.descentM,
    timeEstimates: {
      naismith:  result.distanceKm / 5 + result.ascentM / 600,
      toblerStd: toblerTime(result.elevationPoints, result.distanceKm, 6,   3.5, 0.05),
      toblerCal: toblerTime(result.elevationPoints, result.distanceKm, 4.1, 1.8, 0.02),
    },
    geometry: fullGeometry,
    elevationPoints: result.elevationPoints,
    snapped: true,
    offTrailStart,
    offTrailEnd,
  }
}

async function calcLegStraight(from: Waypoint, to: Waypoint): Promise<LegStats> {
  const { points, distanceKm } = await fetchElevationProfile(from.lat, from.lng, to.lat, to.lng, 50)
  const stats = calcProfileStats(points, distanceKm)
  const elevationPoints = points.map((p, i) => ({
    dist: (i / (points.length - 1)) * distanceKm,
    elevation: p.elevation,
  }))
  return {
    distanceKm: stats.distanceKm,
    ascentM: stats.ascentM,
    descentM: stats.descentM,
    timeEstimates: {
      naismith:  stats.distanceKm / 5 + stats.ascentM / 600,
      toblerStd: toblerTime(elevationPoints, stats.distanceKm, 6,   3.5, 0.05),
      toblerCal: toblerTime(elevationPoints, stats.distanceKm, 4.1, 1.8, 0.02),
    },
    geometry: points.map(p => [p.lat, p.lng] as [number, number]),
    elevationPoints,
    snapped: false,
  }
}

export async function calcLeg(
  from: Waypoint,
  to: Waypoint,
  snap: boolean,
  signal?: AbortSignal
): Promise<LegStats> {
  if (snap) {
    try {
      const result = await fetchSnapRoute(from, to, signal)
      return buildSnapLeg(result, from, to)
    } catch (err) {
      if (err instanceof CreditExhaustedError) throw err
      if (err instanceof DOMException && err.name === 'AbortError') throw err
      if (err instanceof RateLimitedError) {
        await sleep(2000)
        if (signal?.aborted) return calcLegStraight(from, to)
        try {
          const result = await fetchSnapRoute(from, to, signal)
          return buildSnapLeg(result, from, to)
        } catch (retryErr) {
          if (retryErr instanceof CreditExhaustedError) throw retryErr
          if (retryErr instanceof DOMException && (retryErr as DOMException).name === 'AbortError') throw retryErr
          console.warn('[plannerLegs] Retry failed, falling back to straight-line:', retryErr)
        }
      } else {
        console.warn('[plannerLegs] GraphHopper failed, falling back to straight-line:', err)
      }
    }
  }
  return calcLegStraight(from, to)
}
