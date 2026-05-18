import type { Peak } from '@/types'
import { haversineKm } from '@/lib/nearestPeaks'

export function getNearbyPeaks(peak: Peak, allPeaks: Peak[]): Peak[] {
  if (!peak.lat || !peak.lng) return []
  return allPeaks.filter(p => {
    if (p.id === peak.id || !p.lat || !p.lng) return false
    const dist = haversineKm(peak.lat!, peak.lng!, p.lat!, p.lng!)
    return (
      dist < 1.5 &&
      (p.primary_factor ?? 999) < 100 &&
      Math.abs(p.height - peak.height) < 200
    )
  })
}
