import Link from 'next/link'
import { Mountain } from 'lucide-react'
import { forgotPassword } from '@/app/auth/actions'

interface Props {
  searchParams: { error?: string | string[]; sent?: string }
}

export const metadata = { title: 'Glemt passord — Fjelltopper' }

export default function ForgotPasswordPage({ searchParams }: Props) {
  const error = typeof searchParams.error === 'string' ? searchParams.error : undefined
  const sent = searchParams.sent === 'true'

  return (
    <div className="min-h-[calc(100vh-64px)] bg-parchment flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-xl border border-border-warm shadow-sm p-8 w-full max-w-sm">

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <Mountain size={28} className="text-forest mb-2" strokeWidth={1.75} />
          <h1 className="text-xl font-bold text-[#1A1A1A]">Fjelltopper</h1>
          <p className="text-sm text-text-warm mt-1">Tilbakestill passord</p>
        </div>

        {sent ? (
          <div className="px-3 py-3 rounded-lg border text-sm text-center leading-relaxed"
            style={{ background: '#F0F5E8', borderColor: '#C8D8A0', color: '#2D5016' }}>
            Sjekk e-posten din — vi har sendt en lenke for å tilbakestille passordet ditt.
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 px-3 py-2.5 rounded-lg border text-sm"
                style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#B91C1C' }}>
                {error}
              </div>
            )}

            <p className="text-sm text-text-warm mb-4">
              Skriv inn e-postadressen din, så sender vi deg en lenke for å tilbakestille passordet.
            </p>

            <form action={forgotPassword} className="flex flex-col gap-4">
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

              <button
                type="submit"
                className="w-full bg-forest text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity mt-1"
              >
                Send tilbakestillingslenke
              </button>
            </form>
          </>
        )}

        <p className="text-center text-sm text-text-warm mt-5">
          <Link href="/auth/login" className="font-medium text-forest hover:underline">
            Tilbake til innlogging
          </Link>
        </p>
      </div>
    </div>
  )
}
