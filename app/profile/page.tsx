import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Mountain } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { deleteAscent } from '@/app/ascents/actions'

export const metadata = { title: 'Min profil — Fjelltopper' }

interface AscentRow {
  id: string
  peak_id: string
  date: string
  notes: string | null
  weather: string | null
  peak: {
    id: string
    name: string
    height: number
    county: string | null
    municipality: string
  }
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data }, { count }] = await Promise.all([
    supabase
      .from('ascents')
      .select('*, peak:peaks(id, name, height, county, municipality)')
      .eq('user_id', user.id)
      .order('date', { ascending: false }),
    supabase.from('peaks').select('*', { count: 'exact', head: true }),
  ])

  const ascents = (data ?? []) as AscentRow[]
  const totalPeaks = count ?? 0

  const totalCount = ascents.length
  const pct = totalPeaks > 0 ? (totalCount / totalPeaks) * 100 : 0
  const maxHeight = Math.max(...ascents.map(a => a.peak.height), 0)
  const minHeight = ascents.length > 0 ? Math.min(...ascents.map(a => a.peak.height)) : 0
  const totalHeight = ascents.reduce((sum, a) => sum + a.peak.height, 0)
  const avgHeight = totalCount > 0 ? Math.round(totalHeight / totalCount) : 0
  const counties = new Set(ascents.map(a => a.peak.county).filter(Boolean))
  const latestDate = ascents[0]?.date ?? null
  const earliestDate = ascents[ascents.length - 1]?.date ?? null

  const byYear = ascents.reduce((acc, a) => {
    const year = a.date.slice(0, 4)
    if (!acc[year]) acc[year] = []
    acc[year].push(a)
    return acc
  }, {} as Record<string, AscentRow[]>)
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A1A1A]">Min profil</h1>
        <p className="text-sm text-text-warm mt-1">{user.email}</p>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-border-warm shadow-sm p-5 mb-4">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm font-semibold text-[#1A1A1A]">Fremgang</span>
          <span className="text-sm font-bold text-forest">
            {totalCount} av {totalPeaks} topper ({pct.toFixed(1).replace('.', ',')} %)
          </span>
        </div>
        <div className="h-2.5 bg-parchment rounded-full border border-border-warm overflow-hidden">
          <div
            className="h-full bg-forest rounded-full transition-all"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="bg-white rounded-xl border border-border-warm shadow-sm mb-8 overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-border-warm">
          {[
            { value: maxHeight > 0 ? `${maxHeight.toLocaleString('no')} moh` : '—', label: 'Høyeste topp' },
            { value: minHeight > 0 ? `${minHeight.toLocaleString('no')} moh` : '—', label: 'Laveste topp' },
            { value: avgHeight > 0 ? `${avgHeight.toLocaleString('no')} moh` : '—', label: 'Snitthøyde' },
          ].map(({ value, label }) => (
            <div key={label} className="py-5 px-4 text-center">
              <p className="text-xl font-bold text-[#1A1A1A]">{value}</p>
              <p className="text-xs text-text-warm mt-1">{label}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 divide-x divide-border-warm border-t border-border-warm">
          {[
            {
              value: totalHeight > 0 ? `${(totalHeight / 1000).toFixed(1).replace('.', ',')} km` : '—',
              label: 'Summert høyde',
            },
            { value: counties.size > 0 ? `${counties.size}` : '—', label: 'Fylker dekket' },
            {
              value: earliestDate
                ? new Date(earliestDate + 'T12:00:00').toLocaleDateString('no-NO', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })
                : '—',
              label: 'Første bestigning',
            },
          ].map(({ value, label }) => (
            <div key={label} className="py-5 px-4 text-center">
              <p className="text-xl font-bold text-[#1A1A1A]">{value}</p>
              <p className="text-xs text-text-warm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ascent list */}
      {ascents.length === 0 ? (
        <div className="text-center py-16">
          <Mountain size={40} className="text-border-warm mx-auto mb-3" strokeWidth={1.25} />
          <p className="text-text-warm mb-4">Du har ikke registrert noen bestigninger ennå.</p>
          <Link
            href="/peaks"
            className="inline-flex items-center gap-2 bg-forest text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Utforsk topper
          </Link>
        </div>
      ) : (
        <div>
          {years.map(year => (
            <div key={year}>
              <h2 className="text-xs font-semibold text-text-warm uppercase tracking-wide mb-2 mt-6 first:mt-0">
                {year} · {byYear[year].length} bestigning{byYear[year].length !== 1 ? 'er' : ''}
              </h2>
              <div className="flex flex-col gap-2">
                {byYear[year].map(ascent => (
                  <div
                    key={ascent.id}
                    className="bg-white rounded-xl border border-border-warm p-4 flex items-start justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <Link
                          href={`/peaks/${ascent.peak.id}`}
                          className="font-semibold text-[#1A1A1A] hover:text-forest transition-colors"
                        >
                          {ascent.peak.name}
                        </Link>
                        <span className="text-sm text-text-warm">{ascent.peak.height.toLocaleString('no')} moh</span>
                      </div>

                      <p className="text-xs text-text-warm mt-0.5">
                        {new Date(ascent.date + 'T12:00:00').toLocaleDateString('no-NO', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })}
                        {ascent.weather && (
                          <span className="ml-2 text-text-warm">· {ascent.weather}</span>
                        )}
                      </p>

                      {ascent.notes && (
                        <p className="text-xs text-text-warm italic mt-1">{ascent.notes}</p>
                      )}
                    </div>

                    <form action={deleteAscent} className="shrink-0">
                      <input type="hidden" name="peak_id" value={ascent.peak_id} />
                      <button
                        type="submit"
                        className="text-xs text-red-400 hover:text-red-600 transition-colors"
                      >
                        Fjern
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
