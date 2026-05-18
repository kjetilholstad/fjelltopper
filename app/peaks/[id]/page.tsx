import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { nearestPeak } from '@/lib/nearestPeaks'
import { enrichPeaks } from '@/lib/enrichPeaks'
import { logAscent, deleteAscent } from '@/app/ascents/actions'
import type { Peak, Ascent } from '@/types'

interface PeakPageProps {
  params: Promise<{ id: string }>
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('no', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default async function PeakPage({ params }: PeakPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: peakData }, { data: allData }, { data: ascentData }] = await Promise.all([
    supabase.from('peaks').select('*').eq('id', id).single(),
    supabase.from('peaks').select('*'),
    user
      ? supabase.from('ascents').select('*').eq('peak_id', id).eq('user_id', user.id).maybeSingle()
      : Promise.resolve({ data: null as Ascent | null }),
  ])

  if (!peakData) notFound()

  const allEnriched = enrichPeaks((allData ?? []) as Peak[])
  const enrichedPeak = allEnriched.find(p => p.id === id)
  if (!enrichedPeak) notFound()

  const hasSubPeaks = enrichedPeak.sub_peaks && enrichedPeak.sub_peaks.length > 0
  const nearest = hasSubPeaks ? null : nearestPeak(enrichedPeak, allEnriched)
  const ascent = ascentData as Ascent | null
  const today = new Date().toISOString().split('T')[0]

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
          <p className="font-semibold text-stone-800">{(enrichedPeak.primary_factor ?? 0).toLocaleString('no')} m</p>
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

      {/* Bestigningsseksjon */}
      {user && (
        <div className="mt-8">
          {ascent ? (
            /* Allerede bestegt */
            <div className="bg-white rounded-xl border border-border-warm p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={18} className="text-forest" strokeWidth={1.75} />
                <h2 className="text-base font-semibold text-[#1A1A1A]">Bestigning registrert</h2>
              </div>
              <div className="text-sm text-text-warm flex flex-col gap-1 mb-4">
                <p>
                  <span className="font-medium text-[#1A1A1A]">Dato:</span>{' '}
                  {formatDate(ascent.date)}
                </p>
                {ascent.notes && (
                  <p>
                    <span className="font-medium text-[#1A1A1A]">Notater:</span>{' '}
                    {ascent.notes}
                  </p>
                )}
                {ascent.weather && (
                  <p>
                    <span className="font-medium text-[#1A1A1A]">Vær:</span>{' '}
                    {ascent.weather}
                  </p>
                )}
              </div>
              <form action={deleteAscent}>
                <input type="hidden" name="peak_id" value={enrichedPeak.id} />
                <button
                  type="submit"
                  className="text-sm text-text-warm border border-border-warm rounded-lg px-4 py-2 hover:border-red-300 hover:text-red-600 transition-colors"
                >
                  Fjern bestigning
                </button>
              </form>
            </div>
          ) : (
            /* Logg ny bestigning */
            <div className="bg-white rounded-xl border border-border-warm p-5">
              <h2 className="text-base font-semibold text-[#1A1A1A] mb-4">Logg bestigning</h2>
              <form action={logAscent} className="flex flex-col gap-3">
                <input type="hidden" name="peak_id" value={enrichedPeak.id} />
                <div>
                  <label htmlFor="ascent-date" className="block text-xs font-medium text-[#1A1A1A] mb-1.5">
                    Dato
                  </label>
                  <input
                    id="ascent-date"
                    name="date"
                    type="date"
                    required
                    defaultValue={today}
                    className="w-full bg-parchment border border-border-warm rounded-lg px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-forest transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="ascent-notes" className="block text-xs font-medium text-[#1A1A1A] mb-1.5">
                    Notater <span className="text-text-warm font-normal">(valgfritt)</span>
                  </label>
                  <textarea
                    id="ascent-notes"
                    name="notes"
                    rows={3}
                    className="w-full bg-parchment border border-border-warm rounded-lg px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-forest transition-colors resize-none"
                  />
                </div>
                <div>
                  <label htmlFor="ascent-weather" className="block text-xs font-medium text-[#1A1A1A] mb-1.5">
                    Vær <span className="text-text-warm font-normal">(valgfritt)</span>
                  </label>
                  <input
                    id="ascent-weather"
                    name="weather"
                    type="text"
                    placeholder="F.eks. Klarvær, vindstille"
                    className="w-full bg-parchment border border-border-warm rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-text-warm focus:outline-none focus:border-forest transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-forest text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity self-start"
                >
                  Logg bestigning
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
