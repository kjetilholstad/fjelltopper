import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { nearestPeak } from '@/lib/nearestPeaks'
import type { Peak, SubPeak, EnrichedPeak } from '@/types'

interface PeakPageProps {
  params: Promise<{ id: string }>
}

function enrichPeaks(peaks: Peak[]): EnrichedPeak[] {
  const peakMap = new Map(peaks.map(p => [p.id, p]))
  return peaks.map(p => ({
    ...p,
    sub_peaks: (p.sub_peaks as string[] | null)
      ?.map(id => {
        const sp = peakMap.get(id)
        if (!sp) return null
        return {
          id: sp.id,
          name: sp.name,
          height: sp.height,
          pf: sp.primary_factor ?? 0,
          lat: sp.lat ?? undefined,
          lng: sp.lng ?? undefined,
        } as SubPeak
      })
      .filter((x): x is SubPeak => x !== null) ?? null,
  }))
}

export default async function PeakPage({ params }: PeakPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: peakData }, { data: allData }] = await Promise.all([
    supabase.from('peaks').select('*').eq('id', id).single(),
    supabase.from('peaks').select('*'),
  ])

  if (!peakData) notFound()

  const allEnriched = enrichPeaks((allData ?? []) as Peak[])
  const enrichedPeak = allEnriched.find(p => p.id === id)
  if (!enrichedPeak) notFound()

  const hasSubPeaks = enrichedPeak.sub_peaks && enrichedPeak.sub_peaks.length > 0
  const nearest = hasSubPeaks ? null : nearestPeak(enrichedPeak, allEnriched)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6">
        <div className="flex items-start gap-3 flex-wrap">
          <h1 className="text-4xl font-bold text-stone-900">{enrichedPeak.name}</h1>
          <span className="text-base px-3 py-1 mt-1 bg-stone-100 rounded-full font-medium text-stone-700">
            {enrichedPeak.height} moh
          </span>
        </div>
        <p className="text-stone-500 mt-2">
          {enrichedPeak.municipality}, {enrichedPeak.county}
        </p>
      </div>

      {enrichedPeak.description && (
        <p className="text-stone-700 text-lg mb-8">{enrichedPeak.description}</p>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        {enrichedPeak.lat != null && enrichedPeak.lng != null && (
          <div className="bg-white rounded-lg border p-4">
            <p className="text-stone-500 mb-1">Koordinater</p>
            <p className="font-mono text-stone-800">
              {enrichedPeak.lat.toFixed(4)}° N, {enrichedPeak.lng.toFixed(4)}° Ø
            </p>
          </div>
        )}
        <div className="bg-white rounded-lg border p-4">
          <p className="text-stone-500 mb-1">Høyde</p>
          <p className="font-semibold text-stone-800">{enrichedPeak.height} meter over havet</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-stone-500 mb-1">Primærfaktor</p>
          <p className="font-semibold text-stone-800">{enrichedPeak.primary_factor.toLocaleString('no')} m</p>
        </div>
        {enrichedPeak.nearest_higher_peak && (
          <div className="bg-white rounded-lg border p-4">
            <p className="text-stone-500 mb-1">Nærmeste høyere fjell</p>
            <p className="font-semibold text-stone-800">
              {enrichedPeak.nearest_higher_peak}
              {enrichedPeak.secondary_factor != null && (
                <span className="text-stone-500 font-normal ml-1">
                  ({enrichedPeak.secondary_factor < 1000
                    ? `${enrichedPeak.secondary_factor.toLocaleString('no')} m`
                    : `${Math.round(enrichedPeak.secondary_factor / 1000).toLocaleString('no')} km`})
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Nærliggende topper — fra Peakbagger */}
      {hasSubPeaks && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-stone-900 mb-3">
            Nærliggende topper ({enrichedPeak.sub_peaks!.length})
          </h2>
          <div className="flex flex-col gap-2">
            {enrichedPeak.sub_peaks!.map(sp => (
              <div key={sp.id} className="bg-white rounded-lg border border-[#E8E2D9] p-3 flex justify-between items-baseline">
                <Link href={`/peaks/${sp.id}`} className="font-medium text-stone-800 hover:underline">
                  {sp.name}
                </Link>
                <span className="text-sm text-stone-500">
                  {sp.height.toLocaleString('no')} moh
                  <span className="ml-2 text-stone-400">Primærfaktor {sp.pf.toLocaleString('no')} m</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nærmeste fjell over 2000 m — fallback når ingen sub_peaks */}
      {nearest && (
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white rounded-lg border p-4">
            <p className="text-stone-500 mb-1">Nærmeste fjell over 2000 m</p>
            <p className="font-semibold text-stone-800">
              <Link href={`/peaks/${nearest.peak.id}`} className="hover:underline">
                {nearest.peak.name}
              </Link>
              <span className="text-stone-500 font-normal ml-1">
                ({nearest.distanceKm.toFixed(1).replace('.', ',')} km)
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
