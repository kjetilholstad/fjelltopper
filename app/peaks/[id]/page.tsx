import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import peaksData from '@/data/peaks.json'
import type { Peak } from '@/types'

interface PeakPageProps {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  return peaksData.map((peak) => ({ id: peak.id }))
}

export default async function PeakPage({ params }: PeakPageProps) {
  const { id } = await params
  const peak = (peaksData as Peak[]).find((p) => p.id === id)

  if (!peak) notFound()

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6">
        <div className="flex items-start gap-3 flex-wrap">
          <h1 className="text-4xl font-bold text-stone-900">{peak.name}</h1>
          <Badge variant="secondary" className="text-base px-3 py-1 mt-1">
            {peak.height} moh
          </Badge>
        </div>
        <p className="text-stone-500 mt-2">
          {peak.municipality}, {peak.county}
        </p>
      </div>

      {peak.description && (
        <p className="text-stone-700 text-lg mb-8">{peak.description}</p>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-stone-500 mb-1">Koordinater</p>
          <p className="font-mono text-stone-800">
            {peak.lat.toFixed(4)}° N, {peak.lng.toFixed(4)}° Ø
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-stone-500 mb-1">Høyde</p>
          <p className="font-semibold text-stone-800">{peak.height} meter over havet</p>
        </div>
      </div>
    </div>
  )
}
