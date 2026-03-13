import './globals.css';

import type { ReactNode } from 'react';

import { Toaster } from '@/components/ui/sonner';
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
          <PowerSyncProvider />
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
