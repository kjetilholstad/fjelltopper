import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import type { Peak } from '@/types'

interface HomePeakCardProps {
  peak: Peak
  rank: number
  nearestPeakName?: string | null
}

export function HomePeakCard({ peak, rank, nearestPeakName }: HomePeakCardProps) {
  const peakbaggerId = peak.peakbagger_id ?? 8916

  const stats = [
    { label: 'Primærfaktor', value: peak.primary_factor != null ? `${peak.primary_factor.toLocaleString('no')} m` : '—' },
    {
      label: 'Nærmeste høyere fjell',
      value: peak.secondary_factor
        ? (() => {
            const dist = peak.secondary_factor < 1000
              ? `${peak.secondary_factor.toLocaleString('no')} m`
              : `${Math.round(peak.secondary_factor / 1000).toLocaleString('no')} km`
            return peak.nearest_higher_peak ? `${peak.nearest_higher_peak} (${dist})` : dist
          })()
        : '—',
    },
    { label: 'Kommune', value: peak.municipality && peak.municipality !== 'Ukjent' ? peak.municipality : '—' },
    { label: 'Fylke', value: peak.county ?? '—' },
  ]

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E8E2D9' }}>
      {/* Badge */}
      <div
        className="inline-flex items-center text-xs font-semibold text-white px-2.5 py-0.5 rounded-full mb-4"
        style={{ background: '#8B6914' }}
      >
        #{rank} høyeste topp
      </div>

      {/* Name */}
      <h2 className="text-lg font-bold text-[#1A1A1A] mb-1 leading-tight">{peak.name}</h2>

      {/* Height */}
      <p className="mb-5">
        <span className="text-3xl font-bold text-[#2D5016]">{peak.height.toLocaleString('no')}</span>
        <span className="text-sm text-[#6B6560] ml-1.5">moh</span>
      </p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {stats.map(({ label, value }) => (
          <div key={label} className="rounded-lg px-3 py-2.5" style={{ background: '#F7F4EF' }}>
            <p className="text-[10px] font-medium text-[#6B6560] uppercase tracking-wide mb-0.5">{label}</p>
            <p className="text-sm font-semibold text-[#1A1A1A] truncate">{value}</p>
          </div>
        ))}
        {nearestPeakName && (
          <div className="col-span-2 rounded-lg px-3 py-2.5" style={{ background: '#F7F4EF' }}>
            <p className="text-[10px] font-medium text-[#6B6560] uppercase tracking-wide mb-0.5">Nærmeste over 2000 m</p>
            <p className="text-sm font-semibold text-[#1A1A1A] truncate">{nearestPeakName}</p>
          </div>
        )}
      </div>

      {/* Peakbagger link */}
      <a
        href={`https://www.peakbagger.com/peak.aspx?pid=${peakbaggerId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
        style={{ color: '#8B6914' }}
      >
        <ExternalLink size={11} />
        Se på Peakbagger
      </a>

      {/* Detail link */}
      <Link
        href={`/peaks/${peak.id}`}
        className="block text-xs font-medium mt-2 hover:underline"
        style={{ color: '#2D5016' }}
      >
        Se detaljer →
      </Link>
    </div>
  )
}
