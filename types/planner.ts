export interface Waypoint {
  id: string
  lat: number
  lng: number
  label?: string
}

export interface LegStats {
  distanceKm: number
  ascentM: number
  descentM: number
  estimatedHours: number
  geometry: [number, number][]
  elevationPoints: Array<{ dist: number; elevation: number }>
}
