import type { Metadata } from 'next'
import { PlanPageClient } from '@/components/peaks/PlanPageClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Turplanlegger — Fjelltopper',
}

export default function PlanPage() {
  return <PlanPageClient />
}
