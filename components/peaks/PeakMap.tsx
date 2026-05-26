'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Circle, ZoomControl, ScaleControl, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Layers, Route } from 'lucide-react'
import type { EnrichedPeak } from '@/types'
import { nearestPeak, haversineKm } from '@/lib/nearestPeaks'
import { formatDist } from '@/lib/utils'
import { makeIcon } from '@/lib/mapIcons'
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


const ICON_SELECTED = makeIcon(18, '#1A3A0A', 'white')
const ICON_HIGHER   = makeIcon(13, '#D4A017', 'white')
const ICON_NEAREST  = makeIcon(13, '#E8671A', 'white')
const ICON_NEARBY   = makeIcon(11, '#DC2626', 'white')
const ICON_ASCENDED = makeIcon(11, 'white',   '#2D5016')
const ICON_REGULAR  = makeIcon(9,  '#2D5016', 'white')
const ICON_COMPARE  = makeIcon(16, '#E8671A', '#fff')

function getPeakIcon(
  peak: EnrichedPeak,
  selectedPeakId: string | null,
  higherPeakId: string | null,
  nearest2000Id: string | null,
  nearbyIds: Set<string>,
  ascendedIds: Set<string>,
  compareFromId: string | null,
): L.DivIcon {
  if (peak.id === selectedPeakId) return ICON_SELECTED
  if (peak.id === compareFromId)  return ICON_COMPARE
  if (peak.id === higherPeakId)   return ICON_HIGHER
  if (peak.id === nearest2000Id)  return ICON_NEAREST
  if (nearbyIds.has(peak.id))     return ICON_NEARBY
  if (ascendedIds.has(peak.id))   return ICON_ASCENDED
  return ICON_REGULAR
}

function MapFitter({ from, to }: { from: [number, number]; to: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.fitBounds([from, to], { padding: [60, 60], maxZoom: 13 })
  }, [from[0], from[1], to[0], to[1]])
  return null
}

function MapClickHandler({ onMapClick }: { onMapClick: () => void }) {
  useMapEvents({ click: onMapClick })
  return null
}

function FlyToSelected({
  peaks, selectedPeakId, bottomOffsetPx = 0,
}: {
  peaks: EnrichedPeak[]
  selectedPeakId: string | null
  bottomOffsetPx?: number
}) {
  const map = useMap()
  const prevId = useRef<string | null>(null)
  useEffect(() => {
    if (!selectedPeakId || selectedPeakId === prevId.current) return
    prevId.current = selectedPeakId
    const peak = peaks.find(p => p.id === selectedPeakId)
    if (peak?.lat != null && peak?.lng != null) {
      const zoom = 12
      if (bottomOffsetPx > 0) {
        const targetPx = map.project([peak.lat, peak.lng], zoom)
        targetPx.y += bottomOffsetPx
        map.flyTo(map.unproject(targetPx, zoom), zoom, { duration: 0.8 })
      } else {
        map.flyTo([peak.lat, peak.lng], zoom, { duration: 0.8 })
      }
    }
  }, [selectedPeakId, peaks, map, bottomOffsetPx])
  return null
}

function FitBoundsToCollection({ bounds, fitToken }: {
  bounds: [[number, number], [number, number]] | null
  fitToken: number
}) {
  const map = useMap()
  const prevToken = useRef(0)
  useEffect(() => {
    if (!bounds || fitToken === 0 || fitToken === prevToken.current) return
    prevToken.current = fitToken
    map.fitBounds(bounds, { padding: [40, 40] })
  }, [fitToken, bounds, map])
  return null
}

function FitBoundsToProfile({ bounds }: {
  bounds: [[number, number], [number, number]] | null
}) {
  const map = useMap()
  const prevKey = useRef<string | null>(null)
  useEffect(() => {
    if (!bounds) { prevKey.current = null; return }
    const key = `${bounds[0][0]},${bounds[0][1]}|${bounds[1][0]},${bounds[1][1]}`
    if (key === prevKey.current) return
    prevKey.current = key
    const isMobile = window.innerWidth < 640
    const bottomPad = isMobile ? Math.round(window.innerHeight * 0.65) : 40
    map.fitBounds(bounds, {
      paddingTopLeft: [40, 60],
      paddingBottomRight: [40, bottomPad],
      maxZoom: 13,
    })
  }, [bounds, map])
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
  onProfileChange: (profile: { from: EnrichedPeak; to: EnrichedPeak } | null) => void
  flyBottomOffsetPx?: number
  activeProfileBounds?: [[number, number], [number, number]] | null
  resetToken?: number
  collectionBounds?: [[number, number], [number, number]] | null
  fitToken?: number
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
  onProfileChange,
  flyBottomOffsetPx = 0,
  activeProfileBounds,
  resetToken,
  collectionBounds,
  fitToken = 0,
}: PeakMapProps) {
  const [activeLayerId, setActiveLayerId] = useState('topo')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const selectorRef = useRef<HTMLDivElement>(null)

  const [compareMode, setCompareMode] = useState(false)
  const [compareFrom, setCompareFrom] = useState<EnrichedPeak | null>(null)
  const [compareProfile, setCompareProfile] = useState<{ from: EnrichedPeak; to: EnrichedPeak } | null>(null)

  useEffect(() => {
    if (!resetToken) return
    setCompareMode(false)
    setCompareFrom(null)
    setCompareProfile(null)
  }, [resetToken])

  const selectedPeak = useMemo(
    () => peaks.find(p => p.id === selectedPeakId) ?? null,
    [peaks, selectedPeakId]
  )

  const activeLayer = LAYERS.find(l => l.id === activeLayerId) ?? LAYERS[0]

  // Close layer dropdown on outside click
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

  // Auto-trigger profile when a line toggle is activated
  useEffect(() => {
    if (!selectedPeak?.lat || !selectedPeak?.lng) return

    if (activeLines.has('higher') && selectedPeak.nearest_higher_peak) {
      const target = peaks.find(p => p.name === selectedPeak.nearest_higher_peak)
      if (target?.lat && target?.lng) {
        onProfileChange({ from: selectedPeak, to: target })
        return
      }
    }
    if (activeLines.has('nearest2000')) {
      const nearest = nearestPeak(selectedPeak, peaks)
      if (nearest?.peak.lat && nearest?.peak.lng) {
        onProfileChange({ from: selectedPeak, to: nearest.peak })
      }
    }
  }, [activeLines, selectedPeak, peaks])

  const handleMarkerClick = (peak: EnrichedPeak) => {
    if (compareMode) {
      if (!compareFrom) {
        setCompareFrom(peak)
      } else if (compareFrom.id === peak.id) {
        setCompareFrom(null)
      } else {
        const profile = { from: compareFrom, to: peak }
        setCompareProfile(profile)
        onProfileChange(profile)
        setCompareFrom(peak) // sliding window
      }
    } else {
      onSelectPeak(peak)
    }
  }

  const handleMapClick = () => {
    if (compareMode) {
      setCompareFrom(null)
    } else {
      onSelectPeak(null)
    }
  }

  const toggleCompareMode = () => {
    setCompareMode(m => {
      if (m) { setCompareFrom(null); setCompareProfile(null) }
      return !m
    })
  }

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer
        center={[61.6, 8.3]}
        zoom={8}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <ZoomControl position="bottomleft" />
        <ScaleControl position="bottomleft" imperial={false} />
        <TileLayer
          key={activeLayerId}
          attribution={activeLayer.attribution}
          url={activeLayer.url}
          {...(activeLayer.subdomains ? { subdomains: activeLayer.subdomains } : {})}
        />

        <MapClickHandler onMapClick={handleMapClick} />
        <FlyToSelected peaks={peaks} selectedPeakId={selectedPeakId} bottomOffsetPx={flyBottomOffsetPx} />
        <FitBoundsToProfile bounds={activeProfileBounds ?? null} />
        <FitBoundsToCollection bounds={collectionBounds ?? null} fitToken={fitToken} />

        {peaks.map(peak => (
          <Marker
            key={peak.id}
            position={[peak.lat!, peak.lng!]}
            icon={getPeakIcon(peak, selectedPeakId, higherPeakId, nearest2000Id, nearbyIds, ascendedIds, compareFrom?.id ?? null)}
            eventHandlers={{ click: () => handleMarkerClick(peak) }}
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
        {activeLines.has('nearby') && selectedPeak?.lat && selectedPeak?.lng && (
          <Circle
            center={[selectedPeak.lat, selectedPeak.lng]}
            radius={1500}
            pathOptions={{
              color: '#DC2626',
              fillColor: '#DC2626',
              fillOpacity: 0.04,
              weight: 1.5,
              dashArray: '5 5',
            }}
          />
        )}

        {/* Profillinje mellom valgte topper i sammenligningsmodus */}
        {compareProfile?.from.lat != null && compareProfile?.to.lat != null && (
          <>
            <Polyline
              key={`compare-${compareProfile.from.id}-${compareProfile.to.id}`}
              positions={[
                [compareProfile.from.lat, compareProfile.from.lng!],
                [compareProfile.to.lat,   compareProfile.to.lng!],
              ]}
              pathOptions={{ color: '#E8671A', weight: 2.5, opacity: 0.9 }}
            >
              <Tooltip permanent direction="center" className="route-distance-label">
                {formatDist(haversineKm(
                  compareProfile.from.lat, compareProfile.from.lng!,
                  compareProfile.to.lat,   compareProfile.to.lng!
                ) * 1000)}
              </Tooltip>
            </Polyline>
            <MapFitter
              from={[compareProfile.from.lat, compareProfile.from.lng!]}
              to={[compareProfile.to.lat, compareProfile.to.lng!]}
            />
          </>
        )}
      </MapContainer>

      {/* Compare-mode hint — øverst til venstre */}
      {compareMode && (
        <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 1000 }}>
          <div className="bg-white rounded-lg shadow-md border border-[#E8E2D9] px-3 py-1.5 text-xs text-[#6B6560] max-w-[180px] line-clamp-2">
            {compareFrom
              ? `Fra: ${compareFrom.name} — klikk neste topp`
              : 'Klikk på første topp'}
          </div>
        </div>
      )}

      {/* Kartlag-velger + profilknapp — øverst til høyre */}
      <div ref={selectorRef} style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000 }}>
        <div className="flex items-start gap-1.5">
          <button
            onClick={toggleCompareMode}
            title={compareMode ? 'Avslutt profilmodus' : 'Høydeprofil mellom to topper'}
            aria-label={compareMode ? 'Avslutt høydeprofil' : 'Høydeprofil mellom topper'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium shadow-md transition-colors"
            style={{
              background: compareMode ? '#E8671A' : 'white',
              color: compareMode ? 'white' : '#6B6560',
              border: '1px solid #E8E2D9',
            }}
          >
            <Route size={13} />
            <span className="hidden sm:inline">Profil</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(o => !o)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium shadow-md hover:bg-parchment transition-colors"
              style={{ background: 'white', color: '#6B6560', border: '1px solid #E8E2D9' }}
            >
              <Layers size={13} />
              {activeLayer.label}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-md border border-border-warm overflow-hidden min-w-[160px] z-10">
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
      </div>
    </div>
  )
}
