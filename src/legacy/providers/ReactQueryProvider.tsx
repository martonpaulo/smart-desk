'use client';

import { ReactNode, useEffect, useState } from 'react';

import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { HydrationBoundary, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

import { buildStorageKey } from '@/legacy/utils/localStorageUtils';
import { calculateRetryDelay, shouldRetry } from '@/legacy/utils/queryUtils';

// Time during which calendar data is considered fresh and won't be re-fetched
const dataIsFreshForMs = 1000 * 60 * 1; // 1 minute

// Time after which unused calendar data is removed from in-memory cache (React Query)
const dataInMemoryExpiresInMs = 1000 * 60 * 5; // 5 minutes

// Time after which persisted calendar data in localStorage becomes invalid
const dataInLocalStorageExpiresInMs = 1000 * 60 * 10; // 10 minutes

// Maximum number of retry attempts for failed queries
const maxRetryAttempts = 3;

// Maximum delay between retry attempts
const maxRetryDelayMs = 1000 * 30; // 30 seconds

interface ReactQueryProviderProps {
  children: ReactNode;
}

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: dataIsFreshForMs,
            refetchOnMount: true,
            refetchOnWindowFocus: false,
            meta: {
              gcTime: dataInMemoryExpiresInMs,
            },
            retry: (failureCount, error) => shouldRetry(failureCount, error, maxRetryAttempts),
            retryDelay: attempt => calculateRetryDelay(attempt, maxRetryDelayMs),
          },
        },
      }),
  );

  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    const persister = createSyncStoragePersister({
      storage: window.localStorage,
      key: buildStorageKey('react-query-cache'),
    });

    persistQueryClient({
      queryClient,
      persister,
      maxAge: dataInLocalStorageExpiresInMs,
    });

    setIsRestored(true);
  }, [queryClient]);

  if (!isRestored) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={{}}>{children}</HydrationBoundary>
    </QueryClientProvider>
  );
}
