'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function logAscent(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const peak_id = formData.get('peak_id') as string
  const date = formData.get('date') as string
  const notes = (formData.get('notes') as string).trim() || null
  const weather = (formData.get('weather') as string).trim() || null

  await supabase.from('ascents').upsert(
    { user_id: user.id, peak_id, date, notes, weather },
    { onConflict: 'user_id,peak_id' }
  )

  revalidatePath('/peaks')
  revalidatePath(`/peaks/${peak_id}`)
}

export async function deleteAscent(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const peak_id = formData.get('peak_id') as string

  await supabase
    .from('ascents')
    .delete()
    .eq('user_id', user.id)
    .eq('peak_id', peak_id)

  revalidatePath('/peaks')
  revalidatePath(`/peaks/${peak_id}`)
}
