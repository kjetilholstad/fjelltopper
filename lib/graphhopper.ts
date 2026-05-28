import { haversineKm } from './nearestPeaks'

export class CreditExhaustedError extends Error {
  constructor() { super('ORS credit exhausted'); this.name = 'CreditExhaustedError' }
}

export class RateLimitedError extends Error {
  constructor() { super('ORS rate limited'); this.name = 'RateLimitedError' }
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
  const key = process.env.NEXT_PUBLIC_ORS_API_KEY
  if (!key) {
    console.error('[ORS] API key missing — NEXT_PUBLIC_ORS_API_KEY er ikke satt')
    throw new Error('ORS API key missing')
  }

  const url = 'https://api.openrouteservice.org/v2/directions/foot-hiking'
  const body = JSON.stringify({
    coordinates: [[from.lng, from.lat], [to.lng, to.lat]],
    elevation: true,
  })

  console.log('[ORS] POST', url, `from=[${from.lat},${from.lng}]`, `to=[${to.lat},${to.lng}]`)

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body,
    signal,
  })

  console.log('[ORS] HTTP', res.status)

  if (res.status === 429) throw new RateLimitedError()

  const data = await res.json()

  if (!res.ok) {
    const msg = (data?.error?.message ?? data?.message ?? '') as string
    console.error('[ORS] Error response:', msg || JSON.stringify(data))
    if (res.status === 403 || /quota/i.test(msg)) throw new CreditExhaustedError()
    if (/limit|too many/i.test(msg)) throw new RateLimitedError()
    throw new Error(msg || 'ORS error')
  }

  if (!data.features?.length) {
    throw new Error('ORS returned no features')
  }

  const feature = data.features[0]
  const rawCoords: [number, number, number][] = feature.geometry.coordinates
  const summary = feature.properties.summary
  const segment = feature.properties.segments?.[0]

  const airKm = haversineKm(from.lat, from.lng, to.lat, to.lng)
  const routeKm = summary.distance / 1000
  console.log(`[ORS] route ${routeKm.toFixed(2)} km, air ${airKm.toFixed(2)} km, ratio ${(routeKm / airKm).toFixed(2)}`)
  if (routeKm / airKm < 1.05) {
    console.warn('[ORS] Route distance nearly equals air distance — may be a straight-line fallback from the server')
  }

  const snappedFrom: [number, number] = [rawCoords[0][1], rawCoords[0][0]]
  const snappedTo: [number, number] = [rawCoords[rawCoords.length - 1][1], rawCoords[rawCoords.length - 1][0]]

  const geometry: [number, number][] = rawCoords.map(([lng, lat]) => [lat, lng] as [number, number])
  const distanceKm = summary.distance / 1000
  const ascentM: number = segment?.ascent ?? 0
  const descentM: number = segment?.descent ?? 0

  let cumDist = 0
  const elevationPoints: Array<{ dist: number; elevation: number }> = []

  for (let i = 0; i < rawCoords.length; i++) {
    if (i > 0) {
      const [lng1, lat1] = rawCoords[i - 1]
      const [lng2, lat2] = rawCoords[i]
      cumDist += haversineKm(lat1, lng1, lat2, lng2)
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
