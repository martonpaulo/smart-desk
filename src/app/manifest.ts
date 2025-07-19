import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Smart Desk',
    short_name: 'SmartDesk',
    description: 'A smart desk application for managing tasks and schedules',
    lang: 'en-US',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4a90e2',
    icons: [
      {
        src: '/icon.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
    ],
  };
}
