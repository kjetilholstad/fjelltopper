import Link from 'next/link'
import { Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getAscentCounts, getAscentCountsByYear } from '@/lib/ascentCounts'
import type { Peak } from '@/types'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Toppliste — Fjelltopper' }

const YEARS = [2022, 2023, 2024, 2025, 2026]

const RANK_COLORS: Record<number, string> = {
  1: '#D4A017',
  2: '#9CA3AF',
  3: '#CD7F32',
}

interface Props {
  searchParams: { year?: string }
}

export default async function LeaderboardPage({ searchParams }: Props) {
  const yearParam = typeof searchParams.year === 'string' ? parseInt(searchParams.year, 10) : NaN
  const activeYear = isNaN(yearParam) ? null : yearParam

  const supabase = await createClient()

  const [countMap, { data: peaksData }] = await Promise.all([
    activeYear ? getAscentCountsByYear(activeYear) : getAscentCounts(),
    supabase.from('peaks').select('id, name, height, county, municipality'),
  ])

  const peaks = (peaksData ?? []) as Pick<Peak, 'id' | 'name' | 'height' | 'county' | 'municipality'>[]

  const ranked = peaks
    .map(p => ({ ...p, count: countMap[p.id] ?? 0 }))
    .filter(p => p.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 50)

  const total = Object.values(countMap).reduce((s, n) => s + n, 0)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1A1A1A]">Mest besteget</h1>
        <p className="text-text-warm mt-1 font-light">
          {total.toLocaleString('no')} bestigninger registrert totalt
          {activeYear ? ` i ${activeYear}` : ''}
        </p>
      </div>

      {/* Årsfilter */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-1 scrollbar-hide">
        <Link
          href="/leaderboard"
          className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            !activeYear
              ? 'bg-forest text-white'
              : 'border border-border-warm text-text-warm hover:text-forest hover:border-forest'
          }`}
        >
          Alle tider
        </Link>
        {YEARS.map(y => (
          <Link
            key={y}
            href={`/leaderboard?year=${y}`}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeYear === y
                ? 'bg-forest text-white'
                : 'border border-border-warm text-text-warm hover:text-forest hover:border-forest'
            }`}
          >
            {y}
          </Link>
        ))}
      </div>

      {/* Liste */}
      {ranked.length === 0 ? (
        <p className="text-center text-text-warm py-16">
          Ingen bestigninger registrert{activeYear ? ` for ${activeYear}` : ''}.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {ranked.map((peak, i) => {
            const rank = i + 1
            const rankColor = RANK_COLORS[rank]
            return (
              <div
                key={peak.id}
                className="bg-white rounded-xl border border-border-warm shadow-sm px-4 py-3 flex items-center gap-4"
              >
                {/* Rank */}
                <span
                  className="text-sm font-bold w-6 shrink-0 text-center"
                  style={{ color: rankColor ?? '#A89F96' }}
                >
                  {rank}
                </span>

                {/* Fjellinfo */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/peaks/${peak.id}`}
                    className="font-semibold text-[#1A1A1A] hover:text-forest transition-colors text-sm"
                  >
                    {peak.name}
                  </Link>
                  <p className="text-xs text-text-warm">
                    {peak.height.toLocaleString('no')} moh
                    {peak.county ? ` · ${peak.county}` : ''}
                  </p>
                </div>

                {/* Count */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <Users size={13} className="text-text-warm" strokeWidth={1.75} />
                  <span className="text-sm font-semibold text-[#1A1A1A]">
                    {peak.count.toLocaleString('no')}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
