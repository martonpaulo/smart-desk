'use client';

import { ReactNode, useEffect, useState } from 'react';

import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { Persister, PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { buildStorageKey } from 'src/legacy/utils/localStorageUtils';
import { calculateRetryDelay, shouldRetry } from 'src/legacy/utils/queryUtils';

const dataIsFreshForMs = 1000 * 60 * 1;
const dataInMemoryExpiresInMs = 1000 * 60 * 5;
const dataInLocalStorageExpiresInMs = 1000 * 60 * 10;
const maxRetryAttempts = 3;
const maxRetryDelayMs = 1000 * 30;

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: dataIsFreshForMs,
            refetchOnMount: true,
            refetchOnWindowFocus: false,
            meta: { gcTime: dataInMemoryExpiresInMs },
            retry: (count, err) => shouldRetry(count, err, maxRetryAttempts),
            retryDelay: attempt => calculateRetryDelay(attempt, maxRetryDelayMs),
          },
        },
      }),
  );

  const [persister, setPersister] = useState<Persister | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const asyncPersister = createAsyncStoragePersister({
      storage: window.localStorage,
      key: buildStorageKey('react-query-cache'),
    });
    setPersister(asyncPersister);
  }, []);

  if (!persister) return null; // or loading spinner

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: dataInLocalStorageExpiresInMs,
      }}
      onSuccess={() => setIsHydrated(true)}
    >
      {isHydrated && children}
    </PersistQueryClientProvider>
  );
}
