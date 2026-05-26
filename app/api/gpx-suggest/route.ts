import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { haversineKm } from '@/lib/nearestPeaks'

interface Trackpoint { lat: number; lon: number }

const THRESHOLD_KM = 0.3
const MAX_TRACKPOINTS = 50_000

export async function POST(request: NextRequest) {
  let trackpoints: Trackpoint[]
  let collectionId: string | null = null
  try {
    const body = await request.json()
    trackpoints = body.trackpoints
    collectionId = body.collectionId ?? null
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

  let peaks: { id: string; name: string; height: number; lat: number; lng: number }[] = []

  if (collectionId) {
    const { data } = await supabase
      .from('collection_peaks')
      .select('peaks(id, name, height, lat, lng)')
      .eq('collection_id', collectionId)
    peaks = (data ?? [])
      .map((row: any) => row.peaks)
      .filter((p: any) => p && p.lat != null && p.lng != null)
  } else {
    const { data } = await supabase
      .from('peaks')
      .select('id, name, height, lat, lng')
      .gte('height', 2000)
      .not('lat', 'is', null)
      .not('lng', 'is', null)
    peaks = (data ?? []) as typeof peaks
  }

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
