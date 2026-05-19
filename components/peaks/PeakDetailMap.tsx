'use client'

import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import { useRouter } from 'next/navigation'
import L from 'leaflet'
import type { Peak } from '@/types'
import { makeIcon } from '@/lib/mapIcons'
import 'leaflet/dist/leaflet.css'

const ICON_SELECTED = makeIcon(14, '#1A3A0A', 'white')
const ICON_NEARBY   = makeIcon(10, '#E8671A', 'white')

interface PeakDetailMapProps {
  peak: Peak
  nearbyPeaks: Peak[]
}

export default function PeakDetailMap({ peak, nearbyPeaks }: PeakDetailMapProps) {
  const router = useRouter()

  return (
    <MapContainer
      center={[peak.lat!, peak.lng!]}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution="© Kartverket"
        url="https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png"
      />
      <Marker
        position={[peak.lat!, peak.lng!]}
        icon={ICON_SELECTED}
      />
      {nearbyPeaks
        .filter(p => p.lat != null && p.lng != null)
        .map(p => (
          <Marker
            key={p.id}
            position={[p.lat!, p.lng!]}
            icon={ICON_NEARBY}
            eventHandlers={{ click: () => router.push(`/peaks/${p.id}`) }}
          />
        ))}
    </MapContainer>
  )
}
