'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import Link from 'next/link'
import { Layers } from 'lucide-react'
import type { Peak } from '@/types'
import 'leaflet/dist/leaflet.css'

const LAYERS = [
  {
    id: 'topo',
    label: 'Kartverket Topo',
    url: 'https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png',
    attribution: '© Kartverket',
    subdomains: undefined as string | undefined,
  },
  {
    id: 'satellite',
    label: 'Satellitt',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri',
    subdomains: undefined as string | undefined,
  },
  {
    id: 'topo2',
    label: 'OpenTopoMap',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap (CC-BY-SA)',
    subdomains: 'abc',
  },
]

function makeIcon() {
  return L.divIcon({
    html: `<div style="
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #2D5016;
      border: 2px solid white;
      box-shadow: 0 1px 4px rgba(0,0,0,0.35);
    "></div>`,
    className: '',
    iconSize: [10, 10],
    iconAnchor: [5, 5],
    popupAnchor: [0, -8],
  })
}

interface PeakMapProps {
  peaks: Peak[]
}

export function PeakMap({ peaks }: PeakMapProps) {
  const icon = useMemo(() => makeIcon(), [])
  const [activeLayerId, setActiveLayerId] = useState('topo')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const selectorRef = useRef<HTMLDivElement>(null)

  const activeLayer = LAYERS.find(l => l.id === activeLayerId) ?? LAYERS[0]

  useEffect(() => {
    if (!dropdownOpen) return
    function handleClick(e: MouseEvent) {
      if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer
        center={[61.6, 8.3]}
        zoom={8}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          key={activeLayerId}
          attribution={activeLayer.attribution}
          url={activeLayer.url}
          {...(activeLayer.subdomains ? { subdomains: activeLayer.subdomains } : {})}
        />
        {peaks.map((peak) => (
          <Marker key={peak.id} position={[peak.lat!, peak.lng!]} icon={icon}>
            <Popup>
              <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', minWidth: '140px' }}>
                <p style={{ fontWeight: 700, fontSize: '13px', marginBottom: '6px', color: '#1A1A1A' }}>
                  {peak.name}
                </p>
                <p style={{ fontSize: '12px', color: '#6B6560', marginBottom: '2px' }}>
                  ↑ {peak.height.toLocaleString('no')} moh
                </p>
                {peak.primary_factor != null && (
                  <p style={{ fontSize: '12px', color: '#6B6560', marginBottom: '2px' }}>
                    PF: {peak.primary_factor.toLocaleString('no')} m
                  </p>
                )}
                {peak.secondary_factor != null && (
                  <p style={{ fontSize: '12px', color: '#6B6560', marginBottom: '2px' }}>
                    SF: {peak.secondary_factor.toLocaleString('no')} m
                  </p>
                )}
                {peak.municipality && peak.municipality !== 'Ukjent' && (
                  <p style={{ fontSize: '11px', color: '#6B6560', marginTop: '4px' }}>
                    {peak.municipality}, {peak.county}
                  </p>
                )}
                <Link
                  href={`/peaks/${peak.id}`}
                  style={{ fontSize: '12px', color: '#2D5016', fontWeight: 600, display: 'block', marginTop: '6px' }}
                >
                  Se detaljer →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Layer selector */}
      <div
        ref={selectorRef}
        style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000 }}
      >
        <button
          onClick={() => setDropdownOpen(o => !o)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white shadow-md transition-colors"
          style={{ background: '#2D5016' }}
        >
          <Layers size={13} />
          {activeLayer.label}
        </button>

        {dropdownOpen && (
          <div className="mt-1 bg-white rounded-lg shadow-lg border border-border-warm overflow-hidden min-w-[160px]">
            {LAYERS.map(layer => (
              <button
                key={layer.id}
                onClick={() => { setActiveLayerId(layer.id); setDropdownOpen(false) }}
                className="w-full text-left px-3 py-2 text-xs transition-colors hover:bg-parchment"
                style={{
                  color: layer.id === activeLayerId ? '#2D5016' : '#1A1A1A',
                  fontWeight: layer.id === activeLayerId ? 600 : 400,
                  background: layer.id === activeLayerId ? '#F7F4EF' : undefined,
                }}
              >
                {layer.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
