import { createClient } from '@/lib/supabase/server'
import { MapPageClient } from '@/components/peaks/MapPageClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Kart — Fjelltopper',
}

export default async function MapPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <MapPageClient isLoggedIn={!!user} userId={user?.id ?? null} />
}
