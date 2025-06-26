'use client';

import { ReactNode } from 'react';

import { SessionProvider } from 'next-auth/react';

import { AppThemeProvider } from '@/providers/AppThemeProvider';
import { LocationProvider } from '@/providers/LocationProvider';
import { ReactQueryProvider } from '@/providers/ReactQueryProvider';
import { poppins } from '@/styles/fonts';

interface RootLayoutProps {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <title>Smart Desk</title>

      <body suppressHydrationWarning className={poppins.variable}>
        <SessionProvider>
          <LocationProvider>
            <ReactQueryProvider>
              <AppThemeProvider>{children}</AppThemeProvider>
            </ReactQueryProvider>
          </LocationProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
