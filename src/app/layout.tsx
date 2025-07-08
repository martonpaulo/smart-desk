'use client';

import { ReactNode } from 'react';

import { SessionProvider } from 'next-auth/react';

import { AppThemeProvider } from '@/providers/AppThemeProvider';
import { FirebaseAuthProvider } from '@/providers/FirebaseAuthProvider';
import { FirestoreSyncProvider } from '@/providers/FirestoreSyncProvider';
import { LocationProvider } from '@/providers/LocationProvider';
import { ReactQueryProvider } from '@/providers/ReactQueryProvider';
import { ServiceWorkerProvider } from '@/providers/ServiceWorkerProvider';
import { poppins } from '@/styles/fonts';

import '@/lib/dragDropTouch';

interface RootLayoutProps {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <title>Smart Desk</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>

      <body suppressHydrationWarning className={poppins.variable}>
        <SessionProvider>
          <FirebaseAuthProvider>
            <FirestoreSyncProvider>
              <ServiceWorkerProvider>
                <LocationProvider>
                  <ReactQueryProvider>
                    <AppThemeProvider>{children}</AppThemeProvider>
                  </ReactQueryProvider>
                </LocationProvider>
              </ServiceWorkerProvider>
            </FirestoreSyncProvider>
          </FirebaseAuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
