'use client'

import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Layers } from 'lucide-react'
import type { EnrichedPeak } from '@/types'
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

function makeIcon(size: number, bg: string, borderColor = 'white'): L.DivIcon {
  const half = size / 2
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};border:2px solid ${borderColor};box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [half, half],
    popupAnchor: [0, -(half + 2)],
  })
}

const ICON_SELECTED = makeIcon(18, '#1A3A0A', 'white')
const ICON_HIGHER   = makeIcon(13, '#D4A017', 'white')
const ICON_NEAREST  = makeIcon(13, '#E8671A', 'white')
const ICON_NEARBY   = makeIcon(11, '#DC2626', 'white')
const ICON_ASCENDED = makeIcon(11, 'white',   '#2D5016')
const ICON_REGULAR  = makeIcon(9,  '#2D5016', 'white')

function getPeakIcon(
  peak: EnrichedPeak,
  selectedPeakId: string | null,
  higherPeakId: string | null,
  nearest2000Id: string | null,
  nearbyIds: Set<string>,
  ascendedIds: Set<string>,
): L.DivIcon {
  if (peak.id === selectedPeakId) return ICON_SELECTED
  if (peak.id === higherPeakId)   return ICON_HIGHER
  if (peak.id === nearest2000Id)  return ICON_NEAREST
  if (nearbyIds.has(peak.id))     return ICON_NEARBY
  if (ascendedIds.has(peak.id))   return ICON_ASCENDED
  return ICON_REGULAR
}

function MapClickHandler({ onMapClick }: { onMapClick: () => void }) {
  useMapEvents({ click: onMapClick })
  return null
}

type LineType = 'higher' | 'nearest2000' | 'nearby'

interface PeakMapProps {
  peaks: EnrichedPeak[]
  selectedPeakId: string | null
  onSelectPeak: (peak: EnrichedPeak | null) => void
  activeLines: Set<LineType>
  lineData: {
    toHigher: [number, number][][] | null
    higherLabel: { pos: [number, number]; text: string } | null
    toNearest2000: [number, number][][] | null
    nearest2000Label: { pos: [number, number]; text: string } | null
    toNearby: [number, number][][] | null
    nearbyLabels: { pos: [number, number]; text: string }[]
  } | null
  higherPeakId: string | null
  nearest2000Id: string | null
  nearbyIds: Set<string>
  ascendedIds: Set<string>
}

export function PeakMap({
  peaks,
  selectedPeakId,
  onSelectPeak,
  activeLines,
  lineData,
  higherPeakId,
  nearest2000Id,
  nearbyIds,
  ascendedIds,
}: PeakMapProps) {
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

        <MapClickHandler onMapClick={() => onSelectPeak(null)} />

        {peaks.map(peak => (
          <Marker
            key={peak.id}
            position={[peak.lat!, peak.lng!]}
            icon={getPeakIcon(peak, selectedPeakId, higherPeakId, nearest2000Id, nearbyIds, ascendedIds)}
            eventHandlers={{ click: () => onSelectPeak(peak) }}
          />
        ))}

        {/* Nærmeste høyere fjell — gull stiplet */}
        {activeLines.has('higher') && lineData?.toHigher?.map((pos, i) => (
          <Polyline key={`higher-${i}`} positions={pos}
            pathOptions={{ color: '#D4A017', weight: 2, dashArray: '6 4', opacity: 0.85 }} />
        ))}
        {activeLines.has('higher') && lineData?.higherLabel && (
          <Marker
            position={lineData.higherLabel.pos}
            interactive={false}
            icon={L.divIcon({
              html: `<span style="background:rgba(255,255,255,0.85);color:#D4A017;font-size:11px;font-weight:600;padding:1px 4px;border-radius:3px;display:inline-block;transform:translate(-50%,-50%);pointer-events:none">${lineData.higherLabel.text}</span>`,
              className: '',
              iconSize: [1, 1],
              iconAnchor: [0, 0],
            })}
          />
        )}

        {/* Nærmeste over 2000 m — oransje stiplet */}
        {activeLines.has('nearest2000') && lineData?.toNearest2000?.map((pos, i) => (
          <Polyline key={`n2000-${i}`} positions={pos}
            pathOptions={{ color: '#E8671A', weight: 2, dashArray: '6 4', opacity: 0.85 }} />
        ))}
        {activeLines.has('nearest2000') && lineData?.nearest2000Label && (
          <Marker
            position={lineData.nearest2000Label.pos}
            interactive={false}
            icon={L.divIcon({
              html: `<span style="background:rgba(255,255,255,0.85);color:#E8671A;font-size:11px;font-weight:600;padding:1px 4px;border-radius:3px;display:inline-block;transform:translate(-50%,-50%);pointer-events:none">${lineData.nearest2000Label.text}</span>`,
              className: '',
              iconSize: [1, 1],
              iconAnchor: [0, 0],
            })}
          />
        )}

        {/* Nærliggende topper — rød heltrukket + avstandslabel */}
        {activeLines.has('nearby') && lineData?.toNearby?.map((pos, i) => (
          <Polyline key={`nearby-${i}`} positions={pos}
            pathOptions={{ color: '#DC2626', weight: 2, opacity: 0.8 }} />
        ))}
        {activeLines.has('nearby') && lineData?.nearbyLabels?.map(({ pos, text }, i) => (
          <Marker
            key={`nearby-label-${i}`}
            position={pos}
            interactive={false}
            icon={L.divIcon({
              html: `<span style="background:rgba(255,255,255,0.85);color:#DC2626;font-size:11px;font-weight:600;padding:1px 4px;border-radius:3px;display:inline-block;transform:translate(-50%,-50%);pointer-events:none">${text}</span>`,
              className: '',
              iconSize: [1, 1],
              iconAnchor: [0, 0],
            })}
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
