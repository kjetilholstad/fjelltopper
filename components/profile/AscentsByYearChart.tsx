'use client'

interface Props { byYear: Record<string, number> }

export function AscentsByYearChart({ byYear }: Props) {
  const years = Object.keys(byYear).sort()
  const max = Math.max(...Object.values(byYear), 1)

  return (
    <div className="bg-white rounded-xl border border-border-warm p-5 mb-4">
      <p className="text-sm font-semibold text-[#1A1A1A] mb-4">Bestigninger per år</p>
      <div className="flex items-end gap-1" style={{ height: 80 }}>
        {years.map(year => {
          const count = byYear[year]
          const barPx = Math.max(Math.round((count / max) * 56), 4)
          return (
            <div key={year} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-text-warm">{count}</span>
              <div
                className="w-full rounded-sm bg-forest/70"
                style={{ height: barPx }}
              />
              <span className="text-[10px] text-text-warm">{year}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
