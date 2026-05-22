'use client'

import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'

interface YearSelectProps {
  years: number[]
  activeYear: number | null
}

export function YearSelect({ years, activeYear }: YearSelectProps) {
  const router = useRouter()

  return (
    <div className="relative mb-6">
      <select
        value={activeYear ?? ''}
        onChange={e => {
          const val = e.target.value
          router.push(val ? `/leaderboard?year=${val}` : '/leaderboard')
        }}
        className="appearance-none w-full sm:w-48 bg-white border border-border-warm rounded-lg px-3 py-2 pr-8 text-sm text-[#1A1A1A] focus:outline-none focus:border-forest transition-colors cursor-pointer"
      >
        <option value="">Alle tider</option>
        {years.map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-warm pointer-events-none" />
    </div>
  )
}
