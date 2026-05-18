import type { Peak, SubPeak, EnrichedPeak } from '@/types'

export function enrichPeaks(peaks: Peak[]): EnrichedPeak[] {
  const peakMap = new Map(peaks.map(p => [p.id, p]))
  return peaks.map(p => ({
    ...p,
    sub_peaks: (p.sub_peaks as string[] | null)
      ?.map(id => {
        const sp = peakMap.get(id)
        if (!sp) return null
        return {
          id: sp.id,
          name: sp.name,
          height: sp.height,
          pf: sp.primary_factor ?? 0,
          lat: sp.lat ?? undefined,
          lng: sp.lng ?? undefined,
        } as SubPeak
      })
      .filter((x): x is SubPeak => x !== null) ?? null,
  }))
}
