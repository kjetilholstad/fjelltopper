'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Mountain, List, Map, Menu, X } from 'lucide-react'

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const links = [
    { href: '/peaks', label: 'Topper', icon: List },
    { href: '/map', label: 'Kart', icon: Map },
  ]

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
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-forest-50 text-forest'
                    : 'text-text-warm hover:text-forest hover:bg-forest-50'
                }`}
              >
                <Icon size={16} strokeWidth={1.75} />
                {label}
              </Link>
            )
          })}
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
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-forest-50 text-forest'
                    : 'text-text-warm hover:text-forest hover:bg-forest-50'
                }`}
              >
                <Icon size={17} strokeWidth={1.75} />
                {label}
              </Link>
            )
          })}
        </div>
      )}
    </nav>
  )
}
