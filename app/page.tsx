import Link from 'next/link'
import { Mountain, TrendingUp, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()

  const [{ count }, { data: topPeak }, { data: counties }] = await Promise.all([
    supabase.from('peaks').select('*', { count: 'exact', head: true }),
    supabase.from('peaks').select('height').order('height', { ascending: false }).limit(1),
    supabase.from('peaks').select('county'),
  ])

  const totalCount = count ?? 0
  const highestPoint = topPeak?.[0]?.height ?? 2469
  const countyCount = counties ? new Set(counties.map(p => p.county).filter(Boolean)).size : 0

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-16 pb-0 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white border border-border-warm rounded-full px-4 py-1.5 text-sm text-text-warm mb-6">
            <Mountain size={14} className="text-forest" />
            Norges fjelltopper
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-[#1A1A1A] mb-4 tracking-tight text-balance">
            Utforsk Norges<br />
            <span className="text-forest">høyeste topper</span>
          </h1>
          <p className="text-lg text-text-warm mb-10 max-w-lg mx-auto font-light leading-relaxed">
            Komplett oversikt over norske fjelltopper. Søk, filtrer etter primærfaktor og utforsk på kart.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/peaks"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-forest text-white px-7 py-3 text-sm font-semibold hover:bg-forest-600 transition-colors"
            >
              <Mountain size={16} />
              Se alle topper
            </Link>
            <Link
              href="/map"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#8B6914] text-[#8B6914] bg-white px-7 py-3 text-sm font-semibold hover:bg-amber-light transition-colors"
            >
              <MapPin size={16} />
              Åpne kart
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-3 gap-6">
            {[
              { icon: Mountain, value: totalCount.toLocaleString('no'), label: 'Topper registrert' },
              { icon: TrendingUp, value: highestPoint.toLocaleString('no'), label: 'Høyeste punkt (moh)' },
              { icon: MapPin, value: countyCount, label: 'Fylker representert' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="bg-white rounded-xl border border-border-warm p-4 sm:p-5">
                <Icon size={18} className="text-forest mx-auto mb-2" strokeWidth={1.75} />
                <p className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">{value}</p>
                <p className="text-xs text-text-warm mt-1 font-light">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mountain silhouette */}
        <div className="w-full mt-10 leading-none pointer-events-none select-none">
          <svg
            viewBox="0 0 1200 180"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="w-full"
            style={{ display: 'block' }}
          >
            {/* Back range — lighter */}
            <path
              d="M0,180 L0,140 L90,95 L170,125 L260,70 L340,105 L430,55 L510,85 L580,45 L650,75 L730,30 L810,65 L890,40 L970,70 L1050,35 L1130,60 L1200,50 L1200,180 Z"
              fill="#2D5016"
              fillOpacity="0.08"
            />
            {/* Front range — stronger */}
            <path
              d="M0,180 L0,155 L60,130 L130,155 L200,110 L280,145 L360,90 L440,130 L520,75 L600,115 L680,65 L760,105 L840,80 L920,120 L1000,95 L1080,130 L1140,105 L1200,125 L1200,180 Z"
              fill="#2D5016"
              fillOpacity="0.14"
            />
          </svg>
        </div>
      </section>
    </div>
  )
}
