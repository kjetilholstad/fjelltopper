export interface SubPeak {
  id: string
  name: string
  height: number
  pf: number
  lat?: number
  lng?: number
}

export interface Peak {
  id: string
  name: string
  height: number
  primary_factor: number
  secondary_factor: number | null
  parent_peak: string | null
  county: string | null
  municipality: string | null
  lat: number | null
  lng: number | null
  peakbagger_id: number | null
  sub_peaks: SubPeak[] | null
  topo_map: string | null
  description: string | null
  image_url: string | null
  created_at: string
}

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
