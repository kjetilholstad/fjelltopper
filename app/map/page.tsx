import { createClient } from '@/lib/supabase/server'
import { MapPageClient } from '@/components/peaks/MapPageClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Kart — Fjelltopper',
}

export default async function MapPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.is_admin ?? false
  }

  return <MapPageClient isLoggedIn={!!user} userId={user?.id ?? null} isAdmin={isAdmin} />
}
