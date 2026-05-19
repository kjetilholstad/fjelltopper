'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mountain } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passordene stemmer ikke overens.')
      return
    }
    if (password.length < 6) {
      setError('Passordet må være minst 6 tegn.')
      return
    }

    setPending(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setPending(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    router.push('/')
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-parchment flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-xl border border-border-warm shadow-sm p-8 w-full max-w-sm">

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <Mountain size={28} className="text-forest mb-2" strokeWidth={1.75} />
          <h1 className="text-xl font-bold text-[#1A1A1A]">Fjelltopper</h1>
          <p className="text-sm text-text-warm mt-1">Velg nytt passord</p>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2.5 rounded-lg border text-sm"
            style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#B91C1C' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-[#1A1A1A] mb-1.5">
              Nytt passord
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-parchment border border-border-warm rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-text-warm focus:outline-none focus:border-forest transition-colors"
            />
          </div>

          <div>
            <label htmlFor="confirm" className="block text-xs font-medium text-[#1A1A1A] mb-1.5">
              Bekreft passord
            </label>
            <input
              id="confirm"
              type="password"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="w-full bg-parchment border border-border-warm rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-text-warm focus:outline-none focus:border-forest transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-forest text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity mt-1 disabled:opacity-50"
          >
            {pending ? 'Lagrer…' : 'Lagre nytt passord'}
          </button>
        </form>
      </div>
    </div>
  )
}
