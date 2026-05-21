import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Fjelltopper',
    short_name: 'Fjelltopper',
    description: 'Utforsk og logg bestigninger av norske fjelltopper',
    start_url: '/',
    display: 'standalone',
    background_color: '#F7F4EF',
    theme_color: '#2D5016',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    categories: ['sports', 'navigation'],
    lang: 'no',
  }
}
