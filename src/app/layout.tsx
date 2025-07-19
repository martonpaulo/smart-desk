'use client';

import { ReactNode } from 'react';

import { SessionProvider } from 'next-auth/react';

import { NavigationLayout } from '@/navigation/NavigationLayout';
import { AppThemeProvider } from '@/providers/AppThemeProvider';
import { InterfaceSoundProvider } from '@/providers/InterfaceSoundProvider';
import { LocationProvider } from '@/providers/LocationProvider';
import { ReactQueryProvider } from '@/providers/ReactQueryProvider';
import { SupabaseSyncProvider } from '@/providers/SupabaseSyncProvider';
import { ZoomProvider } from '@/providers/ZoomProvider';
import { poppins } from '@/styles/fonts';

import '@/lib/dragDropTouch';

interface RootLayoutProps {
  readonly children: ReactNode;
}

const providers = [
  SessionProvider,
  LocationProvider,
  ReactQueryProvider,
  SupabaseSyncProvider,
  InterfaceSoundProvider,
  ZoomProvider,
  AppThemeProvider,
  NavigationLayout,
];

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <title>Smart Desk</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>

      <body suppressHydrationWarning className={poppins.variable}>
        {providers.reduceRight((children, Provider) => {
          return <Provider>{children}</Provider>;
        }, children)}
      </body>
    </html>
  );
}
