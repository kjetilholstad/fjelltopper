import { getAscentCounts, getAscentCountsByYear, getRawAscents, getRawAscentsByYear } from '@/lib/ascentCounts'
import { LeaderboardClient } from '@/components/leaderboard/LeaderboardClient'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Toppliste — Fjelltopper' }

interface Props {
  searchParams: { year?: string }
}

export default async function LeaderboardPage({ searchParams }: Props) {
  const yearParam = typeof searchParams.year === 'string' ? parseInt(searchParams.year, 10) : NaN
  const activeYear = isNaN(yearParam) ? null : yearParam

  const [countMap, rawAscents] = await Promise.all([
    activeYear ? getAscentCountsByYear(activeYear) : getAscentCounts(),
    activeYear ? getRawAscentsByYear(activeYear) : getRawAscents(),
  ])

  return (
    <LeaderboardClient
      countMap={countMap}
      rawAscents={rawAscents}
      activeYear={activeYear}
    />
  )
}
