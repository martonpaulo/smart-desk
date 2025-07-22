import type { Metadata } from 'next';

export const appMetadata: Metadata = {
  title: {
    default: 'Smart Desk',
    template: '%s | Smart Desk',
  },
  description: 'Smart Desk merges calendar events, tasks and widgets with offline sync.',
  applicationName: 'Smart Desk',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.martonpaulo.com'),
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'Smart Desk',
    description: 'Manage events, tasks and widgets in one smart dashboard.',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.martonpaulo.com',
    siteName: 'Smart Desk',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/web-app-manifest-512x512.png',
        width: 512,
        height: 512,
        alt: 'Smart Desk logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Smart Desk',
    description: 'Smart dashboard for events, tasks and widgets.',
    images: ['/web-app-manifest-512x512.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};
