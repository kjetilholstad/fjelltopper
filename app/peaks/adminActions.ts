'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface PeakUpdate {
  id: string
  name: string
  height: number
  lat: number
  lng: number
}

export async function adminUpdatePeak(update: PeakUpdate): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Ikke innlogget' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return { error: 'Ikke admin' }

  const name = typeof update.name === 'string' ? update.name.trim() : ''
  if (!name) return { error: 'Navn kan ikke være tomt' }
  if (!Number.isFinite(update.height) || update.height <= 0) return { error: 'Ugyldig høyde' }
  if (!Number.isFinite(update.lat) || update.lat < -90 || update.lat > 90) return { error: 'Ugyldig breddegrad' }
  if (!Number.isFinite(update.lng) || update.lng < -180 || update.lng > 180) return { error: 'Ugyldig lengdegrad' }

  const { data: updated, error } = await supabase
    .from('peaks')
    .update({
      name,
      height: update.height,
      lat: update.lat,
      lng: update.lng,
    })
    .eq('id', update.id)
    .select('id')

  if (error) return { error: error.message }
  if (!updated || updated.length === 0) return { error: 'Ingen topp ble oppdatert (finnes ikke, eller mangler tilgang)' }

  revalidatePath('/map')
  revalidatePath('/peaks')
  return { error: null }
}
