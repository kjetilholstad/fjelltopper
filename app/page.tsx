import Link from 'next/link'
import { MapPin, Mountain } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { HomePeakCard } from '@/components/HomePeakCard'
import type { Peak } from '@/types'

export const metadata = {
  title: 'Fjelltopper — Norges høyeste topper',
}

export default async function Home() {
  const supabase = await createClient()

  const [
    { count: totalCount },
    { count: coordCount },
    { data: featuredData },
  ] = await Promise.all([
    supabase.from('peaks').select('*', { count: 'exact', head: true }),
    supabase.from('peaks').select('*', { count: 'exact', head: true }).not('lat', 'is', null).not('lng', 'is', null),
    supabase.from('peaks').select('*').eq('name', 'Galdhøpiggen').limit(1),
  ])

  const total = totalCount ?? 0
  const withCoords = coordCount ?? 0
  const featured = (featuredData?.[0] ?? null) as Peak | null

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="flex-1 bg-parchment px-4 sm:px-6 lg:px-12 pt-14 pb-0">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left column */}
            <div>
              {/* Pill badge */}
              <div
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 mb-6"
                style={{ background: '#EAF3DE', color: '#3B6D11', borderRadius: 20 }}
              >
                ▲ Norges fjelltopper
              </div>

              <h1
                className="text-[#1A1A1A] leading-snug mb-4"
                style={{ fontSize: '2rem', fontWeight: 500 }}
              >
                Utforsk Norges<br />høyeste topper
              </h1>

              <p className="leading-relaxed mb-8 max-w-md" style={{ color: '#6B6560' }}>
                Søk, filtrer og utforsk alle 197 topper over 2000 moh. Kart med koordinater,
                primærfaktor og mer.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/map"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ background: '#2D5016' }}
                >
                  <MapPin size={15} />
                  Åpne kart
                </Link>
                <Link
                  href="/peaks"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-[#1A1A1A] transition-colors hover:bg-white"
                  style={{ border: '1px solid #E8E2D9' }}
                >
                  <Mountain size={15} />
                  Se alle topper
                </Link>
              </div>
            </div>

            {/* Right column — featured peak */}
            <div>
              {featured
                ? <HomePeakCard peak={featured} />
                : (
                  <div
                    className="bg-white rounded-xl p-5 text-sm text-[#6B6560]"
                    style={{ border: '1px solid #E8E2D9' }}
                  >
                    Kunne ikke laste toppdata.
                  </div>
                )
              }
            </div>

          </div>
        </div>

        {/* ── Fjellsilhuett ──────────────────────────────────────── */}
        <div className="w-full mt-10 leading-none pointer-events-none select-none">
          <svg
            viewBox="0 0 1200 100"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            style={{ display: 'block', width: '100%', height: 100 }}
          >
            {/* Layer 1 — bakre rekke, lavest opacity */}
            <path
              d="M0,100 L0,72 L90,52 L180,68 L270,32 L360,58 L450,22 L540,48 L630,14 L720,42 L810,20 L900,44 L990,26 L1080,48 L1150,33 L1200,42 L1200,100 Z"
              fill="#2D5016" fillOpacity="0.15"
            />
            {/* Layer 2 — midtre rekke */}
            <path
              d="M0,100 L0,82 L100,66 L210,78 L320,50 L430,70 L520,40 L610,64 L700,36 L790,56 L870,43 L960,60 L1050,48 L1130,62 L1200,54 L1200,100 Z"
              fill="#2D5016" fillOpacity="0.25"
            />
            {/* Layer 3 — fremre rekke, full opacity */}
            <path
              d="M0,100 L0,96 L70,91 L140,96 L220,80 L300,93 L375,65 L435,84 L495,57 L550,76 L605,88 L665,73 L725,91 L810,83 L895,91 L975,86 L1055,93 L1125,87 L1200,91 L1200,100 Z"
              fill="#2D5016" fillOpacity="1"
            />
            {/* Snøtopp 1 — høyeste punkt ca x=495 */}
            <polygon points="495,57 484,76 506,76" fill="white" fillOpacity="0.88" />
            {/* Snøtopp 2 — nest høyeste ca x=375 */}
            <polygon points="375,65 366,80 384,80" fill="white" fillOpacity="0.88" />
          </svg>
        </div>
      </section>

      {/* ── Stats-bar ───────────────────────────────────────────── */}
      <section className="bg-white" style={{ borderTop: '1px solid #E8E2D9' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-3" style={{ borderColor: '#E8E2D9' }}>
            {[
              { value: total > 0 ? total.toLocaleString('no') : '197', label: 'Topper registrert' },
              { value: (2469).toLocaleString('no'), label: 'Høyeste punkt (moh)' },
              { value: withCoords > 0 ? withCoords.toLocaleString('no') : '190', label: 'Med koordinater' },
            ].map(({ value, label }, i) => (
              <div
                key={label}
                className="py-6 px-4 text-center"
                style={i > 0 ? { borderLeft: '1px solid #E8E2D9' } : undefined}
              >
                <p className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">{value}</p>
                <p className="text-xs mt-1" style={{ color: '#6B6560' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
