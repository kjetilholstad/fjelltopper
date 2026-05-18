'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Mountain, List, Map, Menu, X, LogIn, LogOut } from 'lucide-react'
import { logout } from '@/app/auth/actions'

const LINKS = [
  { href: '/peaks', label: 'Topper', icon: List },
  { href: '/map', label: 'Kart', icon: Map },
]

interface NavbarClientProps {
  userEmail: string | null
}

export function NavbarClient({ userEmail }: NavbarClientProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const linkClass = (href: string) =>
    `flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      pathname.startsWith(href)
        ? 'bg-forest-50 text-forest'
        : 'text-text-warm hover:text-forest hover:bg-forest-50'
    }`

  const mobileLinkClass = (href: string) =>
    `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      pathname.startsWith(href)
        ? 'bg-forest-50 text-forest'
        : 'text-text-warm hover:text-forest hover:bg-forest-50'
    }`

  return (
    <nav className="bg-white border-b border-border-warm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-forest font-bold text-xl tracking-tight">
          <Mountain size={22} strokeWidth={2} />
          Fjelltopper
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={linkClass(href)}>
              <Icon size={16} strokeWidth={1.75} />
              {label}
            </Link>
          ))}

          {/* Desktop auth */}
          {userEmail ? (
            <div className="flex items-center gap-2 ml-2 pl-3 border-l border-border-warm">
              <span className="text-xs text-text-warm">{userEmail}</span>
              <form action={logout}>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-text-warm hover:text-forest hover:bg-forest-50 transition-colors"
                >
                  <LogOut size={15} strokeWidth={1.75} />
                  Logg ut
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-text-warm hover:text-forest hover:bg-forest-50 transition-colors ml-1"
            >
              <LogIn size={16} strokeWidth={1.75} />
              Logg inn
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(o => !o)}
          className="sm:hidden p-2 rounded-lg text-text-warm hover:text-forest hover:bg-forest-50 transition-colors"
          aria-label="Meny"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden border-t border-border-warm bg-white px-4 py-3 flex flex-col gap-1">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={mobileLinkClass(href)}
            >
              <Icon size={17} strokeWidth={1.75} />
              {label}
            </Link>
          ))}

          {/* Mobile auth */}
          <div className="border-t border-border-warm mt-2 pt-2 flex flex-col gap-1">
            {userEmail ? (
              <>
                <p className="text-xs text-text-warm px-3 py-1 truncate">{userEmail}</p>
                <form action={logout}>
                  <button
                    type="submit"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-text-warm hover:text-forest hover:bg-forest-50 transition-colors"
                  >
                    <LogOut size={17} strokeWidth={1.75} />
                    Logg ut
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-text-warm hover:text-forest hover:bg-forest-50 transition-colors"
              >
                <LogIn size={17} strokeWidth={1.75} />
                Logg inn
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
