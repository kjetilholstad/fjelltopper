'use client'

import { MapContainer, TileLayer, Marker, Polyline, ZoomControl, ScaleControl, Tooltip, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import type { Waypoint, LegStats } from '@/types/planner'
import type { Peak } from '@/types'
import 'leaflet/dist/leaflet.css'

const LAYERS = {
  topo: {
    url: 'https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png',
    attribution: '© Kartverket',
    subdomains: undefined as string | undefined,
  },
  topo2: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap (CC-BY-SA)',
    subdomains: 'abc',
  },
}

const ICON_PEAK = L.divIcon({
  html: `<div style="width:9px;height:9px;border-radius:50%;background:#2D5016;border:1.5px solid white;box-shadow:0 1px 3px rgba(0,0,0,.35)"></div>`,
  className: '',
  iconSize: [9, 9],
  iconAnchor: [4.5, 4.5],
})

function makeWaypointIcon(index: number, total: number): L.DivIcon {
  const bg = index === 0 ? '#2D5016' : index === total - 1 ? '#D4A017' : '#E8671A'
  const label = String(index + 1)
  return L.divIcon({
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${bg};border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:white;font-family:system-ui,sans-serif">${label}</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

function MapClickAdder({ onAdd }: { onAdd: (lat: number, lng: number) => void }) {
  useMapEvents({ click: e => onAdd(e.latlng.lat, e.latlng.lng) })
  return null
}

interface PlannerMapProps {
  waypoints: Waypoint[]
  legs: (LegStats | null)[]
  peaks: Peak[]
  snapEnabled: boolean
  onAddWaypoint: (lat: number, lng: number, label?: string) => void
  onMoveWaypoint: (id: string, lat: number, lng: number) => void
  onRemoveWaypoint: (id: string) => void
}

export function PlannerMap({
  waypoints,
  legs,
  peaks,
  snapEnabled,
  onAddWaypoint,
  onMoveWaypoint,
  onRemoveWaypoint,
}: PlannerMapProps) {
  const layer = snapEnabled ? LAYERS.topo2 : LAYERS.topo

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer
        center={[61.6, 8.3]}
        zoom={7}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" imperial={false} />
        <TileLayer
          key={snapEnabled ? 'topo2' : 'topo'}
          attribution={layer.attribution}
          url={layer.url}
          {...(layer.subdomains ? { subdomains: layer.subdomains } : {})}
        />

        <MapClickAdder onAdd={onAddWaypoint} />

        {/* Peak markers */}
        {peaks.map(peak => (
          <Marker
            key={peak.id}
            position={[peak.lat!, peak.lng!]}
            icon={ICON_PEAK}
            eventHandlers={{
              click() {
                onAddWaypoint(peak.lat!, peak.lng!, peak.name)
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -6]} opacity={0.92}>
              <span className="text-xs font-medium">{peak.name}</span>
              <span className="text-[10px] text-[#6B6560] ml-1">{peak.height.toLocaleString('no')} moh</span>
            </Tooltip>
          </Marker>
        ))}

        {/* Calculated leg lines */}
        {legs.map((leg, i) =>
          leg && leg.geometry.length >= 2 ? (
            <Polyline
              key={`leg-${i}`}
              positions={leg.geometry}
              pathOptions={{
                color: '#2D5016',
                weight: 3,
                opacity: 0.85,
                dashArray: snapEnabled ? undefined : '7 5',
              }}
            />
          ) : null
        )}

        {/* Pending leg placeholders */}
        {waypoints.slice(1).map((wp, i) =>
          legs[i] ? null : (
            <Polyline
              key={`pending-${i}`}
              positions={[[waypoints[i].lat, waypoints[i].lng], [wp.lat, wp.lng]]}
              pathOptions={{ color: '#A89F96', weight: 2, dashArray: '4 4', opacity: 0.5 }}
            />
          )
        )}

        {/* Waypoint markers */}
        {waypoints.map((wp, i) => (
          <Marker
            key={wp.id}
            position={[wp.lat, wp.lng]}
            icon={makeWaypointIcon(i, waypoints.length)}
            draggable
            eventHandlers={{
              dragend(e) {
                const { lat, lng } = (e.target as L.Marker).getLatLng()
                onMoveWaypoint(wp.id, lat, lng)
              },
              contextmenu() {
                onRemoveWaypoint(wp.id)
              },
            }}
          />
        ))}
      </MapContainer>

      {waypoints.length === 0 && (
        <div style={{ position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
          <div className="bg-white rounded-lg shadow-md border border-[#E8E2D9] px-4 py-2 text-xs text-[#6B6560] whitespace-nowrap">
            Klikk på kartet eller en topp for å legge til vegpunkter
          </div>
        </div>
      )}
    </div>
  )
}
