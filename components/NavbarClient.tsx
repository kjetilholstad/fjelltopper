'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Mountain, List, Map, User, Menu, X, LogIn, LogOut, Info, Trophy, Route, ChevronDown } from 'lucide-react'
import { logout } from '@/app/auth/actions'
import { useCollection } from '@/context/CollectionContext'

const ALL_LINKS = [
  { href: '/peaks',       label: 'Topper',   icon: List,   requiresAuth: false },
  { href: '/map',         label: 'Kart',      icon: Map,   requiresAuth: false },
  { href: '/plan',        label: 'Planlegg',  icon: Route, requiresAuth: false },
  { href: '/leaderboard', label: 'Toppliste', icon: Trophy, requiresAuth: false },
  { href: '/info',        label: 'Info',      icon: Info,  requiresAuth: false },
  // Profil er fjernet herfra — den ligger i profil-dropdown
]

interface NavbarClientProps {
  userEmail: string | null
  isLoggedIn: boolean
}

export function NavbarClient({ userEmail, isLoggedIn }: NavbarClientProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [, startTransition] = useTransition()
  const { collections, activeCollection, setActiveCollection } = useCollection()

  const links = ALL_LINKS.filter(l => !l.requiresAuth || isLoggedIn)

  useEffect(() => {
    if (!profileOpen) return
    const handler = () => setProfileOpen(false)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [profileOpen])

  const linkClass = (href: string) =>
    `flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      pathname === href || pathname.startsWith(href + '/')
        ? 'bg-forest-50 text-forest'
        : 'text-text-warm hover:text-forest hover:bg-forest-50'
    }`

  const mobileLinkClass = (href: string) =>
    `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      pathname === href || pathname.startsWith(href + '/')
        ? 'bg-forest-50 text-forest'
        : 'text-text-warm hover:text-forest hover:bg-forest-50'
    }`

  return (
    <nav className="bg-white border-b border-border-warm sticky top-0 z-[3000]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-forest font-bold text-xl tracking-tight">
          <Mountain size={22} strokeWidth={2} />
          Fjelltopper
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={linkClass(href)}>
              <Icon size={16} strokeWidth={1.75} />
              {label}
            </Link>
          ))}

          {/* Desktop: profil-dropdown */}
          <div className="relative ml-2" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setProfileOpen(o => !o)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-text-warm hover:text-forest hover:bg-forest-50 transition-colors"
              aria-label="Profil og innstillinger"
            >
              <User size={16} strokeWidth={1.75} />
              {isLoggedIn ? (
                <span className="hidden lg:inline">{userEmail?.split('@')[0]}</span>
              ) : (
                <span>Logg inn</span>
              )}
              <ChevronDown size={13} strokeWidth={2} className={`transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-border-warm rounded-xl shadow-sm py-2 z-50">
                {/* Collection-velger */}
                {collections.length > 1 && activeCollection && (
                  <div className="px-3 pb-2 mb-1 border-b border-border-warm">
                    <p className="text-[10px] text-text-warm uppercase tracking-wide mb-1.5">Samling</p>
                    <div className="flex gap-1.5">
                      {collections.map(c => (
                        <button
                          key={c.id}
                          onClick={() => { setActiveCollection(c); setProfileOpen(false) }}
                          className={`flex-1 text-xs font-medium py-1 rounded-full transition-colors ${
                            c.id === activeCollection.id
                              ? 'bg-forest text-white'
                              : 'text-text-warm border border-border-warm hover:border-forest hover:text-forest'
                          }`}
                        >
                          {c.slug === 'norges-2000m' ? '2000m' : c.slug === 'verden' ? 'Verden' : c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Auth-handlinger */}
                {isLoggedIn ? (
                  <>
                    <div className="px-3 py-1">
                      <p className="text-xs text-text-warm truncate">{userEmail}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-text-warm hover:text-forest hover:bg-forest-50 transition-colors"
                    >
                      <User size={15} strokeWidth={1.75} />
                      Profil
                    </Link>
                    <button
                      type="button"
                      onClick={() => startTransition(() => logout())}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-warm hover:text-forest hover:bg-forest-50 transition-colors"
                    >
                      <LogOut size={15} strokeWidth={1.75} />
                      Logg ut
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-text-warm hover:text-forest hover:bg-forest-50 transition-colors"
                  >
                    <LogIn size={15} strokeWidth={1.75} />
                    Logg inn
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={(e) => { if (e.detail === 0) return; setOpen(o => !o) }}
          className="sm:hidden p-2 rounded-lg text-text-warm hover:text-forest hover:bg-forest-50 transition-colors"
          aria-label="Meny"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden border-t border-border-warm bg-white px-4 py-3 flex flex-col gap-1">

          {links.map(({ href, label, icon: Icon }) => (
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
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-text-warm hover:text-forest hover:bg-forest-50 transition-colors"
                >
                  <User size={17} strokeWidth={1.75} />
                  Profil
                </Link>
                <button
                  type="button"
                  onClick={() => startTransition(() => logout())}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-text-warm hover:text-forest hover:bg-forest-50 transition-colors"
                >
                  <LogOut size={17} strokeWidth={1.75} />
                  Logg ut
                </button>
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

          {/* Collection-velger (mobil) — nederst */}
          {collections.length > 1 && activeCollection && (
            <div className="border-t border-border-warm mt-2 pt-3 pb-1">
              <p className="text-[10px] text-text-warm uppercase tracking-wide mb-2 px-1">Samling</p>
              <div className="flex gap-2">
                {collections.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setActiveCollection(c); setOpen(false) }}
                    className={`flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors ${
                      c.id === activeCollection.id
                        ? 'bg-forest text-white'
                        : 'text-text-warm border border-border-warm hover:border-forest hover:text-forest'
                    }`}
                  >
                    {c.slug === 'norges-2000m' ? 'Norske 2000m' : c.slug === 'verden' ? 'Verden' : c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
