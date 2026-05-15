export interface Peak {
  id: string
  name: string
  height: number
  county: string
  municipality: string
  lat: number
  lng: number
  primary_factor: number | null
  secondary_factor: number | null
  parent_peak: string | null
  sub_peaks: Array<{ name: string; height: number; primary_factor?: number | null }> | null
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
