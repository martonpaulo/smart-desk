import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Smart Desk',
    short_name: 'SmartDesk',
    description: 'A smart desk application for managing tasks and schedules',
    lang: 'en-US',
    start_url: '/',
    display: 'standalone',
    theme_color: '#f5f7fa',
    background_color: '#f5f7fa',
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
