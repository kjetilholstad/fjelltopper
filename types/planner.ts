export interface Waypoint {
  id: string
  lat: number
  lng: number
  label?: string
  snapToNext?: boolean
}

export interface LegStats {
  distanceKm: number
  ascentM: number
  descentM: number
  estimatedHours: number
  geometry: [number, number][]
  elevationPoints: Array<{ dist: number; elevation: number }>
  snapped: boolean
  offTrailStart?: [number, number][]
  offTrailEnd?: [number, number][]
}
