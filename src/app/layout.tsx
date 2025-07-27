'use client';

import { ReactNode } from 'react';

import { SessionProvider } from 'next-auth/react';
import { SnackbarProvider } from 'notistack';

import { AppThemeProvider } from '@/core/providers/AppThemeProvider';
import { SupabaseSyncProvider } from '@/core/providers/SupabaseSyncProvider';
import { InterfaceSoundProvider } from '@/features/sound/providers/InterfaceSoundProvider';
import { NavigationLayout } from '@/legacy/navigation/NavigationLayout';
import { DateAdapterProvider } from '@/legacy/providers/DateAdapterProvider';
import { LocationProvider } from '@/legacy/providers/LocationProvider';
import { ReactQueryProvider } from '@/legacy/providers/ReactQueryProvider';
import { ZoomProvider } from '@/legacy/providers/ZoomProvider';
import { poppins } from '@/theme/fonts';

import '@/legacy/lib/dragDropTouch';

interface RootLayoutProps {
  readonly children: ReactNode;
}

const providers = [
  { Component: SessionProvider },
  { Component: LocationProvider },
  { Component: ReactQueryProvider },
  { Component: SupabaseSyncProvider },
  { Component: InterfaceSoundProvider },
  { Component: ZoomProvider },
  { Component: DateAdapterProvider },
  { Component: AppThemeProvider },
  { Component: NavigationLayout },
  {
    Component: SnackbarProvider,
    props: {
      maxSnack: 3,
      anchorOrigin: {
        vertical: 'bottom' as const,
        horizontal: 'right' as const,
      },
    },
  },
];

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <title>Smart Desk</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="apple-mobile-web-app-title" content="Smart Desk" />
      </head>

      <body suppressHydrationWarning className={poppins.variable}>
        {providers.reduceRight((acc, { Component, props = {} }) => {
          return <Component {...props}>{acc}</Component>;
        }, children)}
      </body>
    </html>
  );
}
