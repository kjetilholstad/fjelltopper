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
  signal?: AbortSignal,
  options?: { disableCH?: boolean }
): Promise<SnapRouteResult> {
  const key = process.env.NEXT_PUBLIC_GRAPHHOPPER_API_KEY
  if (!key) {
    console.error('[GraphHopper] API key missing — NEXT_PUBLIC_GRAPHHOPPER_API_KEY er ikke satt')
    throw new Error('GraphHopper API key missing')
  }
  const extra = options?.disableCH ? '&ch.disable=true' : ''
  const url =
    `https://graphhopper.com/api/1/route` +
    `?point=${from.lat},${from.lng}&point=${to.lat},${to.lng}` +
    `&profile=hike&locale=no&points_encoded=false&elevation=true` +
    `&avoid=ferry&avoid=motorway&avoid=trunk&key=${key}${extra}`

  console.log('[GraphHopper] GET', url.replace(key ?? '', '<KEY>'), options?.disableCH ? '(CH disabled)' : '')

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

  if (!data.paths?.length) {
    throw new Error('GraphHopper returned no paths')
  }

  const path = data.paths[0]
  const airKm = haversineKm(from.lat, from.lng, to.lat, to.lng)
  const routeKm = path.distance / 1000
  console.log(`[GraphHopper] route ${routeKm.toFixed(2)} km, air ${airKm.toFixed(2)} km, ratio ${(routeKm / airKm).toFixed(2)}`)
  if (routeKm / airKm < 1.05) {
    console.warn('[GraphHopper] Route distance nearly equals air distance — may be a straight-line fallback from the server')
  }

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
