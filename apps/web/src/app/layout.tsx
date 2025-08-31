'use client';

import { ReactNode } from 'react';

import { SessionProvider } from 'next-auth/react';

import { MobileMotionController } from '@/core/components/MobileMotionController';
import { AppThemeProvider } from '@/core/providers/AppThemeProvider';
import { SupabaseSyncProvider } from '@/core/providers/SupabaseSyncProvider';
import { InterfaceSoundProvider } from '@/features/sound/providers/InterfaceSoundProvider';
import { NavigationLayout } from '@/legacy/navigation/NavigationLayout';
import { DateAdapterProvider } from '@/legacy/providers/DateAdapterProvider';
import { LocationProvider } from '@/legacy/providers/LocationProvider';
import { ReactQueryProvider } from '@/legacy/providers/ReactQueryProvider';
import { ZoomProvider } from '@/legacy/providers/ZoomProvider';
import { PromiseFeedbackProvider } from '@/shared/context/PromiseFeedbackContext';
import { SnackbarWrapperProvider } from '@/shared/providers/SnackbarWrapperProvider';
import { jetbrainsMono, poppins } from '@/theme/fonts';

import '@/legacy/lib/dragDropTouch';

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
  DateAdapterProvider,
  AppThemeProvider,
  NavigationLayout,
  SnackbarWrapperProvider,
  PromiseFeedbackProvider,
  MobileMotionController,
];

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <title>Smart Desk</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="apple-mobile-web-app-title" content="Smart Desk" />
      </head>

      <body suppressHydrationWarning className={`${poppins.variable} ${jetbrainsMono.variable}`}>
        {providers.reduceRight((acc, Provider) => {
          return <Provider>{acc}</Provider>;
        }, children)}
      </body>
    </html>
  );
}
