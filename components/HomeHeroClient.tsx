'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapPin, Mountain } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCollection } from '@/context/CollectionContext'
import { HomePeakCard } from '@/components/HomePeakCard'
import { nearestPeak } from '@/lib/nearestPeaks'
import type { Peak } from '@/types'

export function HomeHeroClient() {
  const { activeCollection } = useCollection()
  const [featured, setFeatured] = useState<Peak | null>(null)
  const [featuredRank, setFeaturedRank] = useState<number>(1)
  const [collectionPeaks, setCollectionPeaks] = useState<Peak[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeCollection) return
    let cancelled = false
    setLoading(true)

    const supabase = createClient()

    async function fetchData() {
      const { data } = await supabase
        .from('collection_peaks')
        .select('peaks(*)')
        .eq('collection_id', activeCollection!.id)

      if (cancelled) return

      const peaks = (data ?? [])
        .map((row: any) => row.peaks as Peak)
        .filter(Boolean)
        .sort((a: Peak, b: Peak) => (b.height ?? 0) - (a.height ?? 0))

      setCollectionPeaks(peaks)

      if (peaks.length === 0) {
        setLoading(false)
        return
      }

      const randomIndex = Math.floor(Math.random() * peaks.length)
      setFeatured(peaks[randomIndex])
      setFeaturedRank(randomIndex + 1)
      setLoading(false)
    }

    fetchData()
    return () => { cancelled = true }
  }, [activeCollection?.id])

  const isSenja = activeCollection?.slug === 'senja'
  const badgeText = isSenja ? '▲ Senja' : '▲ Norges fjelltopper'
  const headline = isSenja
    ? <>Utforsk Senjas<br />topper</>
    : <>Utforsk Norges<br />høyeste topper</>
  const subtext = isSenja
    ? `Søk, filtrer og utforsk alle ${collectionPeaks.length || ''} topper på Senja-øya. Kart med koordinater, primærfaktor og mer.`
    : `Søk, filtrer og utforsk alle ${collectionPeaks.length || ''} topper over 2000 moh. Kart med koordinater, primærfaktor og mer.`

  const nearest = featured ? nearestPeak(featured, collectionPeaks) : null

  return (
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
      {/* Left column */}
      <div>
        <div
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 mb-6"
          style={{ background: '#EAF3DE', color: '#3B6D11', borderRadius: 20 }}
        >
          {badgeText}
        </div>

        <h1 className="text-[#1A1A1A] leading-snug mb-4 text-[1.5rem] sm:text-[2rem] font-medium">
          {headline}
        </h1>

        <p className="leading-relaxed mb-8 max-w-md" style={{ color: '#6B6560' }}>
          {subtext}
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

      {/* Right column — featured peak (skjult på mobil) */}
      <div className="hidden sm:block min-h-[280px]">
        {loading ? (
          <div className="bg-white rounded-xl p-5 animate-pulse h-64" style={{ border: '1px solid #E8E2D9' }} />
        ) : featured ? (
          <HomePeakCard
            peak={featured}
            rank={featuredRank}
            nearest={nearest ?? null}
            allPeaks={collectionPeaks}
            nearestHigherLabel={activeCollection?.nearestHigherLabel}
          />
        ) : (
          <div
            className="bg-white rounded-xl p-5 text-sm text-[#6B6560]"
            style={{ border: '1px solid #E8E2D9' }}
          >
            Kunne ikke laste toppdata.
          </div>
        )}
      </div>
    </div>
  )
}
