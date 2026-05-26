import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { CollectionProvider } from '@/components/CollectionProvider'

export const metadata: Metadata = {
  title: 'Fjelltopper — Norske fjelltopper',
  description: 'Utforsk og logg bestigninger av norske fjelltopper.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Fjelltopper',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2D5016',
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body>
        <CollectionProvider>
          <Navbar />
          <main>{children}</main>
        </CollectionProvider>
      </body>
    </html>
  )
}
