import Link from 'next/link'
import { Mountain } from 'lucide-react'
import { login } from '@/app/auth/actions'

interface Props {
  searchParams: { error?: string | string[] }
}

export const metadata = { title: 'Logg inn — Fjelltopper' }

export default function LoginPage({ searchParams }: Props) {
  const error = typeof searchParams.error === 'string' ? searchParams.error : undefined

  return (
    <div className="min-h-[calc(100vh-64px)] bg-parchment flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-xl border border-border-warm shadow-sm p-8 w-full max-w-sm">

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <Mountain size={28} className="text-forest mb-2" strokeWidth={1.75} />
          <h1 className="text-xl font-bold text-[#1A1A1A]">Fjelltopper</h1>
          <p className="text-sm text-text-warm mt-1">Logg inn på din konto</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-3 py-2.5 rounded-lg border text-sm"
            style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#B91C1C' }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form action={login} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-[#1A1A1A] mb-1.5">
              E-post
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full bg-parchment border border-border-warm rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-text-warm focus:outline-none focus:border-forest transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="text-xs font-medium text-[#1A1A1A]">
                Passord
              </label>
              <Link href="/auth/forgot-password" className="text-xs text-text-warm hover:text-forest transition-colors">
                Glemt passord?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full bg-parchment border border-border-warm rounded-lg px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-forest transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-forest text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity mt-1"
          >
            Logg inn
          </button>
        </form>

        {/* Footer link */}
        <p className="text-center text-sm text-text-warm mt-5">
          Har du ikke konto?{' '}
          <Link href="/auth/register" className="font-medium text-forest hover:underline">
            Registrer deg
          </Link>
        </p>
      </div>
    </div>
  )
}
