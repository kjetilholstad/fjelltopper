'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Layers } from 'lucide-react'
import type { Peak, SubPeak } from '@/types'
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

function makeIcon(size: number, bg: string): L.DivIcon {
  const half = size / 2
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [half, half],
    popupAnchor: [0, -(half + 2)],
  })
}

const ICON_REGULAR    = makeIcon(10, '#2D5016')
const ICON_PARENT     = makeIcon(12, '#2D5016')
const ICON_SUB        = makeIcon(8,  '#5A8A30')
const ICON_SELECTED   = makeIcon(14, '#1A3A0A')
const ICON_ACTIVE_SUB = makeIcon(10, '#E8671A')

function peakIcon(peak: Peak, selectedPeakId: string | null): L.DivIcon {
  if (peak.id === selectedPeakId) return ICON_SELECTED
  if (peak.parent_peak) return ICON_SUB
  if (peak.sub_peaks && peak.sub_peaks.length > 0) return ICON_PARENT
  return ICON_REGULAR
}

function MapClickHandler({ onMapClick }: { onMapClick: () => void }) {
  useMapEvents({ click: onMapClick })
  return null
}

interface PeakMapProps {
  peaks: Peak[]
  selectedPeakId: string | null
  onSelectPeak: (peak: Peak | null) => void
}

export function PeakMap({ peaks, selectedPeakId, onSelectPeak }: PeakMapProps) {
  const [activeLayerId, setActiveLayerId] = useState('topo')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const selectorRef = useRef<HTMLDivElement>(null)

  const activeLayer = LAYERS.find(l => l.id === activeLayerId) ?? LAYERS[0]

  const activeSubs = useMemo<SubPeak[]>(() => {
    if (!selectedPeakId) return []
    const sel = peaks.find(p => p.id === selectedPeakId)
    if (!sel?.sub_peaks) return []
    return sel.sub_peaks.filter(sp => sp.lat != null && sp.lng != null)
  }, [peaks, selectedPeakId])

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

        <MapClickHandler onMapClick={() => onSelectPeak(null)} />

        {peaks.map(peak => (
          <Marker
            key={peak.id}
            position={[peak.lat!, peak.lng!]}
            icon={peakIcon(peak, selectedPeakId)}
            eventHandlers={{ click: () => onSelectPeak(peak) }}
          />
        ))}

        {activeSubs.map(sp => (
          <Marker
            key={`sub-${sp.id}`}
            position={[sp.lat!, sp.lng!]}
            icon={ICON_ACTIVE_SUB}
          />
        ))}
      </MapContainer>

      {/* Kartlag-velger — øverst til høyre */}
      <div ref={selectorRef} style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000 }}>
        <button
          onClick={() => setDropdownOpen(o => !o)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white shadow-md"
          style={{ background: '#2D5016' }}
        >
          <Layers size={13} />
          {activeLayer.label}
        </button>

        {dropdownOpen && (
          <div className="mt-1 bg-white rounded-xl shadow-md border border-border-warm overflow-hidden min-w-[160px]">
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
