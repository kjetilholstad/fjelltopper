import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Fjelltopper — Norske fjelltopper',
  description: 'Utforsk og logg bestigninger av norske fjelltopper.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
