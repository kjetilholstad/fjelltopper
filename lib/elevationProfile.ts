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
  n = 50
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
  })
  if (!res.ok) throw new Error('Elevation batch fetch failed')

  const data = await res.json()
  const raw: (number | null)[] = data.elevations
  const elevations = fillNulls(raw)
  const points = coords.map((c, i) => ({ ...c, elevation: elevations[i] }))

  return { points, distanceKm }
}

export interface ProfileStats {
  distanceKm: number
  ascentM: number
  descentM: number
  estimatedHours: number
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
  const estimatedHours = distanceKm / 5 + ascentM / 600 + descentM / 1000
  return { distanceKm, ascentM: Math.round(ascentM), descentM: Math.round(descentM), estimatedHours }
}
