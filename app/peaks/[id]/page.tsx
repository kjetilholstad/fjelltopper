import Link from 'next/link'
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import { CheckCircle2, ExternalLink, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { nearestPeak, distanceToNearestHigher } from '@/lib/nearestPeaks'
import { getNearbyPeaks } from '@/lib/nearbyPeaks'
import { getAscentCounts } from '@/lib/ascentCounts'
import { logAscent, deleteAscent } from '@/app/ascents/actions'
import { EditAscentButton } from '@/components/profile/EditAscentButton'
import { formatDist } from '@/lib/utils'
import type { Peak, Ascent } from '@/types'

const PeakDetailMap = dynamic(
  () => import('@/components/peaks/PeakDetailMap'),
  { ssr: false }
)

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

  const [{ data: peakData }, { data: allData }, { data: ascentData }, countMap] = await Promise.all([
    supabase.from('peaks').select('*').eq('id', id).single(),
    supabase.from('peaks').select('id, name, height, lat, lng, primary_factor, nearest_higher_peak'),
    user
      ? supabase.from('ascents').select('*').eq('peak_id', id).eq('user_id', user.id).maybeSingle()
      : Promise.resolve({ data: null as Ascent | null }),
    getAscentCounts(),
  ])

  if (!peakData) notFound()

  const peak = peakData as Peak
  const allPeaks = (allData ?? []) as Peak[]

  const nearbyPeaks = getNearbyPeaks(peak, allPeaks)
  const nearest = nearbyPeaks.length > 0 ? null : nearestPeak(peak, allPeaks)
  const distanceToHigher = distanceToNearestHigher(peak, allPeaks)
  const ascent = ascentData as Ascent | null
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-stone-900">{peak.name}</h1>
        <p className="text-stone-500 text-sm mt-1">
          {peak.height.toLocaleString('no')} moh · {peak.municipality}, {peak.county}
        </p>
      </div>

      {peak.lat != null && peak.lng != null && (
        <>
          <div className="h-72 sm:h-96 rounded-xl overflow-hidden border border-border-warm mt-6">
            <PeakDetailMap peak={peak} nearbyPeaks={nearbyPeaks} />
          </div>
          <a
            href={`https://geohack.toolforge.org/geohack.php?language=no&pagename=${encodeURIComponent(peak.name)}&params=${peak.lat}_N_${peak.lng}_E_`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-stone-400 hover:text-stone-600 transition-colors mt-2 inline-flex items-center gap-1"
          >
            {peak.lat.toFixed(6)}° N, {peak.lng.toFixed(6)}° Ø
            <ExternalLink size={10} />
          </a>
        </>
      )}

      {(countMap[id] ?? 0) > 0 && (
        <p className="flex items-center gap-1.5 text-sm text-text-warm mt-3">
          <Users size={14} strokeWidth={1.75} />
          {countMap[id].toLocaleString('no')} {countMap[id] === 1 ? 'person har besteget' : 'personer har besteget'} denne toppen
        </p>
      )}

      {peak.description && (
        <p className="text-stone-700 text-lg mt-6">{peak.description}</p>
      )}

      {/* Stats */}
      {(() => {
        const nearestHigherPeak = peak.nearest_higher_peak
          ? allPeaks.find(p => p.name === peak.nearest_higher_peak) ?? null
          : null
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 mt-6 px-4 sm:px-6">
            <div>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-stone-400 mb-1">Høyde</p>
              <p className="font-semibold text-stone-900 text-sm">{peak.height.toLocaleString('no')} moh</p>
            </div>
            <div className="sm:border-l sm:border-stone-100 sm:pl-6">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-stone-400 mb-1">Primærfaktor</p>
              <p className="font-semibold text-stone-900 text-sm">{(peak.primary_factor ?? 0).toLocaleString('no')} m</p>
            </div>
            <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-stone-100 pt-3 sm:pt-0 sm:pl-6">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-stone-400 mb-1">Nærmeste høyere</p>
              <p className="font-semibold text-stone-900 text-sm">
                {nearestHigherPeak && distanceToHigher != null
                  ? `${nearestHigherPeak.name} (${nearestHigherPeak.height.toLocaleString('no')} moh – ${formatDist(distanceToHigher * 1000)})`
                  : '—'}
              </p>
            </div>
          </div>
        )
      })()}

      {/* Eksterne lenker */}
      {(peak.peakbagger_id != null || peak.peakbook_id != null) && (
        <div className="flex gap-4 border-t border-stone-100 pt-3 mt-4">
          {peak.peakbagger_id != null && (
            <a
              href={`https://www.peakbagger.com/peak.aspx?pid=${peak.peakbagger_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 transition-colors"
            >
              <ExternalLink size={12} />
              Peakbagger
            </a>
          )}
          {peak.peakbook_id != null && (
            <a
              href={`https://peakbook.org/peakbook-element/${peak.peakbook_id}/${encodeURIComponent(peak.name).replace(/%20/g, '+')}.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 transition-colors"
            >
              <ExternalLink size={12} />
              Peakbook
            </a>
          )}
        </div>
      )}

      {/* Nærliggende topper */}
      {nearbyPeaks.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-stone-900 mb-3">
            Nærliggende topper ({nearbyPeaks.length})
          </h2>
          <div className="flex flex-col gap-2">
            {nearbyPeaks.map(p => (
              <div key={p.id} className="bg-white rounded-lg border border-[#E8E2D9] p-3 flex justify-between items-baseline">
                <Link href={`/peaks/${p.id}`} className="font-medium text-stone-800 hover:underline">
                  {p.name}
                </Link>
                <span className="text-sm text-stone-500">
                  {p.height.toLocaleString('no')} moh
                  <span className="ml-2 text-stone-400">Primærfaktor {(p.primary_factor ?? 0).toLocaleString('no')} m</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nærmeste fjell over 2000 m — fallback når ingen nærliggende */}
      {nearest && (
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white rounded-lg border p-4">
            <p className="text-stone-500 mb-1">Nærmeste over 2000 m (PF ≥ 30 m)</p>
            <p className="font-semibold text-stone-800">
              <Link href={`/peaks/${nearest.peak.id}`} className="hover:underline">
                {nearest.peak.name}
              </Link>
              <span className="text-stone-500 font-normal ml-1">
                ({nearest.peak.height.toLocaleString('no')} moh – {formatDist(nearest.distanceKm * 1000)})
              </span>
            </p>
          </div>
        </div>
      )}

      <hr className="border-stone-100 mt-6" />

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
              <div className="flex items-center gap-3 flex-wrap">
                <form action={deleteAscent}>
                  <input type="hidden" name="peak_id" value={peak.id} />
                  <button
                    type="submit"
                    className="text-sm text-text-warm border border-border-warm rounded-lg px-4 py-2 hover:border-red-300 hover:text-red-600 transition-colors"
                  >
                    Fjern bestigning
                  </button>
                </form>
                <EditAscentButton
                  ascentId={ascent.id}
                  peakId={peak.id}
                  peakName={peak.name}
                  currentDate={ascent.date}
                  currentNotes={ascent.notes}
                  currentWeather={ascent.weather}
                />
              </div>
            </div>
          ) : (
            /* Logg ny bestigning */
            <div className="bg-white rounded-xl border border-border-warm p-5">
              <h2 className="text-base font-semibold text-[#1A1A1A] mb-4">Logg bestigning</h2>
              <form action={logAscent} className="flex flex-col gap-3">
                <input type="hidden" name="peak_id" value={peak.id} />
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
                    className="w-full h-10 bg-white border border-border-warm rounded-lg px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-forest transition-colors"
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
