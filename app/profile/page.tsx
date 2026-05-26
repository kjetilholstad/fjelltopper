import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileClient } from '@/components/profile/ProfileClient'

export const metadata = { title: 'Min profil — Fjelltopper' }

interface AscentRow {
  id: string
  peak_id: string
  date: string
  notes: string | null
  weather: string | null
  peak: {
    id: string
    name: string
    height: number
    county: string | null
    municipality: string
    primary_factor: number | null
  }
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data } = await supabase
    .from('ascents')
    .select('*, peak:peaks(id, name, height, county, municipality, primary_factor)')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  const ascents = (data ?? []) as AscentRow[]

  return <ProfileClient ascents={ascents} userEmail={user.email ?? ''} />
}
