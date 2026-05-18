export interface Peak {
  id: string
  name: string
  height: number
  primary_factor: number | null
  secondary_factor: number | null
  nearest_higher_peak: string | null
  county: string | null
  municipality: string
  lat: number | null
  lng: number | null
  peakbagger_id: number | null
  topo_map: string | null
  description: string | null
  image_url: string | null
  created_at: string
}

export type EnrichedPeak = Peak

export interface Ascent {
  id: string
  user_id: string
  peak_id: string
  date: string
  notes: string | null
  weather: string | null
  created_at: string
  peak?: Peak
}

export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface AscentWithPeak extends Ascent {
  peak: Peak
}
