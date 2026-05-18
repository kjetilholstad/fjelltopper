import type { Peak, EnrichedPeak } from '@/types'

export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371
  const toRad = (d: number) => d * Math.PI / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function distanceToNearestHigher(peak: Peak, allPeaks: Peak[]): number | null {
  if (!peak.nearest_higher_peak || peak.lat == null || peak.lng == null) return null
  const target = allPeaks.find(p => p.name === peak.nearest_higher_peak)
  if (!target || target.lat == null || target.lng == null) return null
  return haversineKm(peak.lat, peak.lng, target.lat, target.lng)
}

export function nearestPeak(
  peak: EnrichedPeak,
  allPeaks: EnrichedPeak[]
): { peak: EnrichedPeak; distanceKm: number } | null {
  if (!peak.lat || !peak.lng) return null
  const candidates = allPeaks
    .filter(p => p.id !== peak.id && p.lat && p.lng)
    .map(p => ({
      peak: p,
      distanceKm: haversineKm(peak.lat!, peak.lng!, p.lat!, p.lng!),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
  return candidates[0] ?? null
}
