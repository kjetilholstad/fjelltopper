import Link from 'next/link'
import { Mountain } from 'lucide-react'
import { register } from '@/app/auth/actions'

interface Props {
  searchParams: { error?: string | string[] }
}

export const metadata = { title: 'Registrer deg — Fjelltopper' }

export default function RegisterPage({ searchParams }: Props) {
  const error = typeof searchParams.error === 'string' ? searchParams.error : undefined

  return (
    <div className="min-h-[calc(100vh-64px)] bg-parchment flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-xl border border-border-warm shadow-sm p-8 w-full max-w-sm">

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <Mountain size={28} className="text-forest mb-2" strokeWidth={1.75} />
          <h1 className="text-xl font-bold text-[#1A1A1A]">Fjelltopper</h1>
          <p className="text-sm text-text-warm mt-1">Opprett en ny konto</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-3 py-2.5 rounded-lg border text-sm"
            style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#B91C1C' }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form action={register} className="flex flex-col gap-4">
          <div>
            <label htmlFor="full_name" className="block text-xs font-medium text-[#1A1A1A] mb-1.5">
              Fullt navn
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              autoComplete="name"
              className="w-full bg-parchment border border-border-warm rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-text-warm focus:outline-none focus:border-forest transition-colors"
            />
          </div>

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
            <label htmlFor="password" className="block text-xs font-medium text-[#1A1A1A] mb-1.5">
              Passord
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              className="w-full bg-parchment border border-border-warm rounded-lg px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-forest transition-colors"
            />
          </div>

          <div>
            <label htmlFor="confirm_password" className="block text-xs font-medium text-[#1A1A1A] mb-1.5">
              Bekreft passord
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              required
              autoComplete="new-password"
              className="w-full bg-parchment border border-border-warm rounded-lg px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-forest transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-forest text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity mt-1"
          >
            Registrer deg
          </button>
        </form>

        {/* Footer link */}
        <p className="text-center text-sm text-text-warm mt-5">
          Har du konto?{' '}
          <Link href="/auth/login" className="font-medium text-forest hover:underline">
            Logg inn
          </Link>
        </p>
      </div>
    </div>
  )
}
