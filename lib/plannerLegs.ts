import { fetchElevationProfile, calcProfileStats } from './elevationProfile'
import { fetchSnapRoute, CreditExhaustedError } from './graphhopper'
import type { Waypoint, LegStats } from '@/types/planner'

export { CreditExhaustedError }

export async function calcLeg(
  from: Waypoint,
  to: Waypoint,
  snap: boolean
): Promise<LegStats> {
  if (snap) {
    try {
      const result = await fetchSnapRoute(from, to)
      const estimatedHours = result.distanceKm / 5 + result.ascentM / 600
      return {
        distanceKm: result.distanceKm,
        ascentM: result.ascentM,
        descentM: result.descentM,
        estimatedHours,
        geometry: result.geometry,
        elevationPoints: result.elevationPoints,
      }
    } catch (err) {
      if (err instanceof CreditExhaustedError) throw err
      console.warn('[plannerLegs] GraphHopper failed, falling back to straight-line:', err)
    }
  }

  const { points, distanceKm } = await fetchElevationProfile(from.lat, from.lng, to.lat, to.lng, 50)
  const stats = calcProfileStats(points, distanceKm)
  const geometry: [number, number][] = points.map(p => [p.lat, p.lng] as [number, number])
  const elevationPoints = points.map((p, i) => ({
    dist: (i / (points.length - 1)) * distanceKm,
    elevation: p.elevation,
  }))
  return {
    distanceKm: stats.distanceKm,
    ascentM: stats.ascentM,
    descentM: stats.descentM,
    estimatedHours: stats.estimatedHours,
    geometry,
    elevationPoints,
  }
}
