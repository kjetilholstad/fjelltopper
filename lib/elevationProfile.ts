export function interpolatePoints(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
  n = 50
): Array<{ lat: number; lng: number }> {
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1)
    return { lat: lat1 + t * (lat2 - lat1), lng: lng1 + t * (lng2 - lng1) }
  })
}

function fillNulls(arr: (number | null)[]): number[] {
  return arr.map((v, i) => {
    if (v !== null) return v
    let prev: number | null = null, next: number | null = null
    for (let j = i - 1; j >= 0; j--) { if (arr[j] !== null) { prev = arr[j] as number; break } }
    for (let j = i + 1; j < arr.length; j++) { if (arr[j] !== null) { next = arr[j] as number; break } }
    return prev !== null && next !== null ? (prev + next) / 2 : (prev ?? next ?? 0)
  })
}

export async function fetchElevationProfile(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
  n = 50,
  signal?: AbortSignal
): Promise<{ points: Array<{ lat: number; lng: number; elevation: number }>; distanceKm: number }> {
  const toRad = (d: number) => d * Math.PI / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  const distanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  const coords = interpolatePoints(lat1, lng1, lat2, lng2, n)

  const res = await fetch('/api/elevation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ points: coords }),
    signal,
  })
  if (!res.ok) throw new Error('Elevation batch fetch failed')

  const data = await res.json()
  const raw: (number | null)[] = data.elevations
  const elevations = fillNulls(raw)
  const points = coords.map((c, i) => ({ ...c, elevation: elevations[i] }))

  return { points, distanceKm }
}

export function toblerTime(
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
    if (dDist < 0.0005) continue   // < 0.5 m, numerisk støy
    const dElev = points[i].elevation - points[i - 1].elevation
    const sRaw = (dElev / 1000) / dDist
    const s = Math.max(-1.5, Math.min(1.5, sRaw))
    h += dDist / (A * Math.exp(-B * Math.abs(s + C)))
  }
  return h
}

export interface ProfileStats {
  distanceKm: number
  ascentM: number
  descentM: number
  estimatedHours: number   // = toblerCal, beholdes for bakoverkompatibilitet
  timeEstimates: {
    naismith:  number
    toblerStd: number
    toblerCal: number
  }
}

export function calcProfileStats(
  points: Array<{ elevation: number }>,
  distanceKm: number
): ProfileStats {
  let ascentM = 0, descentM = 0
  for (let i = 1; i < points.length; i++) {
    const diff = points[i].elevation - points[i - 1].elevation
    if (diff > 0) ascentM += diff
    else descentM += Math.abs(diff)
  }
  const elevPts = points.map((p, i) => ({
    dist: (i / (points.length - 1)) * distanceKm,
    elevation: p.elevation,
  }))
  const timeEstimates = {
    naismith:  distanceKm / 5 + ascentM / 600,
    toblerStd: toblerTime(elevPts, distanceKm, 6.0, 3.5, 0.05),
    toblerCal: toblerTime(elevPts, distanceKm, 4.1, 1.7, 0.02),
  }
  return {
    distanceKm,
    ascentM: Math.round(ascentM),
    descentM: Math.round(descentM),
    estimatedHours: timeEstimates.toblerCal,
    timeEstimates,
  }
}
