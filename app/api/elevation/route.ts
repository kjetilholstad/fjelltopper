import { NextRequest, NextResponse } from 'next/server'

// POST { points: [{lat, lng}] } — fetches all elevations in a single Kartverket request
export async function POST(req: NextRequest) {
  const body = await req.json()
  const points: Array<{ lat: number; lng: number }> = body.points

  if (!points?.length) return NextResponse.json({ error: 'Missing points' }, { status: 400 })
  if (points.length > 50) return NextResponse.json({ error: 'Max 50 points' }, { status: 400 })

  // Kartverket expects [ost/lon, nord/lat] order
  const punkter = points.map(p => [p.lng, p.lat])
  const url = `https://ws.geonorge.no/hoydedata/v1/punkt?koordsys=4258&punkter=${encodeURIComponent(JSON.stringify(punkter))}`

  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) return NextResponse.json({ error: 'Kartverket feil' }, { status: 502 })

  const data = await res.json()
  const elevations = (data.punkter ?? []).map((p: { z?: number }) => p.z ?? null)

  return NextResponse.json({ elevations })
}
