import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Smart Desk',
    short_name: 'Smart Desk',
    description: 'A productivity app for managing tasks and events',
    lang: 'en-US',
    start_url: '/',
    display: 'standalone',
    orientation: 'landscape-primary',
    theme_color: '#f5f7fa',
    background_color: '#f5f7fa',
    categories: ['productivity', 'utilities'],
    icons: [
      {
        src: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
