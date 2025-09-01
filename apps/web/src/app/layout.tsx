'use client';

import '@/legacy/lib/dragDropTouch';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';

import { MobileMotionController } from 'src/core/components/MobileMotionController';
import { AppThemeProvider } from 'src/core/providers/AppThemeProvider';
import { SupabaseSyncProvider } from 'src/core/providers/SupabaseSyncProvider';
import { InterfaceSoundProvider } from 'src/features/sound/providers/InterfaceSoundProvider';
import { NavigationLayout } from 'src/legacy/navigation/NavigationLayout';
import { DateAdapterProvider } from 'src/legacy/providers/DateAdapterProvider';
import { LocationProvider } from 'src/legacy/providers/LocationProvider';
import { ReactQueryProvider } from 'src/legacy/providers/ReactQueryProvider';
import { ZoomProvider } from 'src/legacy/providers/ZoomProvider';
import { PromiseFeedbackProvider } from 'src/shared/context/PromiseFeedbackContext';
import { SnackbarWrapperProvider } from 'src/shared/providers/SnackbarWrapperProvider';
import { jetbrainsMono, poppins } from 'src/theme/fonts';

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
