import { haversineKm } from './nearestPeaks'

export class CreditExhaustedError extends Error {
  constructor() { super('GraphHopper credit exhausted'); this.name = 'CreditExhaustedError' }
}

export class RateLimitedError extends Error {
  constructor() { super('GraphHopper rate limited'); this.name = 'RateLimitedError' }
}

export interface SnapRouteResult {
  geometry: [number, number][]
  distanceKm: number
  ascentM: number
  descentM: number
  elevationPoints: Array<{ dist: number; elevation: number }>
  snappedFrom: [number, number]
  snappedTo: [number, number]
}

export async function fetchSnapRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  signal?: AbortSignal
): Promise<SnapRouteResult> {
  const key = process.env.NEXT_PUBLIC_GRAPHHOPPER_API_KEY
  const url =
    `https://graphhopper.com/api/1/route` +
    `?point=${from.lat},${from.lng}&point=${to.lat},${to.lng}` +
    `&profile=foot&locale=no&points_encoded=false&elevation=true&key=${key}`

  console.log('[GraphHopper] GET', url.replace(key ?? '', '<KEY>'))

  const res = await fetch(url, { signal })

  console.log('[GraphHopper] HTTP', res.status)

  if (res.status === 429) throw new RateLimitedError()

  const data = await res.json()

  if (!res.ok) {
    const msg = (data?.message ?? '') as string
    console.error('[GraphHopper] Error response:', msg || JSON.stringify(data))
    if (/credit|quota/i.test(msg)) throw new CreditExhaustedError()
    if (/limit|too many/i.test(msg)) throw new RateLimitedError()
    throw new Error(msg || 'GraphHopper error')
  }

  const path = data.paths[0]
  const rawCoords: [number, number, number][] = path.points.coordinates

  const snappedFrom: [number, number] = [rawCoords[0][1], rawCoords[0][0]]
  const snappedTo: [number, number] = [rawCoords[rawCoords.length - 1][1], rawCoords[rawCoords.length - 1][0]]

  const geometry: [number, number][] = rawCoords.map(([lng, lat]) => [lat, lng] as [number, number])
  const distanceKm = path.distance / 1000

  let ascentM = 0, descentM = 0, cumDist = 0
  const elevationPoints: Array<{ dist: number; elevation: number }> = []

  for (let i = 0; i < rawCoords.length; i++) {
    if (i > 0) {
      const [lng1, lat1] = rawCoords[i - 1]
      const [lng2, lat2] = rawCoords[i]
      cumDist += haversineKm(lat1, lng1, lat2, lng2)
      const diff = (rawCoords[i][2] ?? 0) - (rawCoords[i - 1][2] ?? 0)
      if (diff > 0) ascentM += diff
      else descentM += Math.abs(diff)
    }
    elevationPoints.push({ dist: cumDist, elevation: rawCoords[i][2] ?? 0 })
  }

  return {
    geometry,
    distanceKm,
    ascentM: Math.round(ascentM),
    descentM: Math.round(descentM),
    elevationPoints,
    snappedFrom,
    snappedTo,
  }
}
