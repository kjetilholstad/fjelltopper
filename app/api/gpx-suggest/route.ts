import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

interface Trackpoint { lat: number; lon: number }

const THRESHOLD_KM = 0.3
const MAX_TRACKPOINTS = 50_000

export async function POST(request: NextRequest) {
  let trackpoints: Trackpoint[]
  try {
    const body = await request.json()
    trackpoints = body.trackpoints
    if (!Array.isArray(trackpoints) || trackpoints.length === 0) {
      return NextResponse.json({ error: 'No trackpoints' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (trackpoints.length > MAX_TRACKPOINTS) {
    trackpoints = trackpoints.slice(0, MAX_TRACKPOINTS)
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from('peaks')
    .select('id, name, height, lat, lng')
    .gte('height', 2000)
    .not('lat', 'is', null)
    .not('lng', 'is', null)

  const peaks = (data ?? []) as { id: string; name: string; height: number; lat: number; lng: number }[]

  const suggestions = peaks
    .map(peak => {
      let minDist = Infinity
      for (const pt of trackpoints) {
        const d = haversineKm(peak.lat, peak.lng, pt.lat, pt.lon)
        if (d < minDist) minDist = d
        if (minDist < 0.01) break
      }
      return { id: peak.id, name: peak.name, height: peak.height, minDistanceM: minDist * 1000 }
    })
    .filter(p => p.minDistanceM < THRESHOLD_KM * 1000)
    .sort((a, b) => b.height - a.height)

  return NextResponse.json({ suggestions })
}
