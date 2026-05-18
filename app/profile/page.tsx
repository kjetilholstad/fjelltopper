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

  const { data } = await supabase
    .from('ascents')
    .select('*, peak:peaks(id, name, height, county, municipality)')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  const ascents = (data ?? []) as AscentRow[]

  const totalCount = ascents.length
  const maxHeight = totalCount > 0 ? Math.max(...ascents.map(a => a.peak.height)) : 0
  const totalHeight = ascents.reduce((sum, a) => sum + a.peak.height, 0)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A1A1A]">Min profil</h1>
        <p className="text-sm text-text-warm mt-1">{user.email}</p>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl border border-border-warm shadow-sm mb-8 overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-border-warm">
          {[
            { value: totalCount.toLocaleString('no'), label: 'Bestigninger' },
            { value: maxHeight > 0 ? `${maxHeight.toLocaleString('no')} moh` : '—', label: 'Høyeste topp' },
            { value: totalHeight > 0 ? `${totalHeight.toLocaleString('no')} m` : '—', label: 'Summert høyde' },
          ].map(({ value, label }) => (
            <div key={label} className="py-6 px-4 text-center">
              <p className="text-2xl font-bold text-[#1A1A1A]">{value}</p>
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
        <div className="flex flex-col gap-3">
          {ascents.map(ascent => (
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
      )}
    </div>
  )
}
