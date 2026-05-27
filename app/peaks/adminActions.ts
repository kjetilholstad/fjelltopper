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

  const { error } = await supabase
    .from('peaks')
    .update({
      name: update.name,
      height: update.height,
      lat: update.lat,
      lng: update.lng,
    })
    .eq('id', update.id)

  if (error) return { error: error.message }

  revalidatePath('/map')
  revalidatePath('/peaks')
  return { error: null }
}
