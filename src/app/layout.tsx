import './globals.css';

import type { ReactNode } from 'react';

import { Toaster } from '@/components/ui/sonner';
import { I18nProvider } from '@/providers/i18n-provider';
import { PowerSyncProvider } from '@/providers/powersync-provider';
import { QueryProvider } from '@/providers/query-provider';

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html className="dark" lang="en">
      <body>
        <QueryProvider>
          <I18nProvider>
            <PowerSyncProvider />
            {children}
            <Toaster />
          </I18nProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
