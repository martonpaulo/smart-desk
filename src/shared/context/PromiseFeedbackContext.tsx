'use client';

import { createContext, ReactNode, useContext, useMemo } from 'react';

import { useLoadingRegistry } from '@/shared/hooks/useLoadingRegistry';
import { useRunWithFeedback } from '@/shared/hooks/useRunWithFeedback';
import { PromiseFeedback } from '@/shared/types/PromiseFeedback';

export interface PromiseFeedbackContextValue {
  isLoading: (key: string) => boolean;
  runWithFeedback: <T>(opts: PromiseFeedback<T>) => Promise<T | undefined>;
}

export interface PromiseFeedbackProviderProps {
  children: ReactNode;
}

const PromiseFeedbackContext = createContext<PromiseFeedbackContextValue | null>(null);

export function PromiseFeedbackProvider({ children }: PromiseFeedbackProviderProps) {
  const { add, remove, isLoading } = useLoadingRegistry();
  const { runWithFeedback } = useRunWithFeedback({ add, remove });

  const value = useMemo<PromiseFeedbackContextValue>(
    () => ({ isLoading: (key: string) => isLoading(key), runWithFeedback }),
    [isLoading, runWithFeedback],
  );

  return (
    <PromiseFeedbackContext.Provider value={value}>{children}</PromiseFeedbackContext.Provider>
  );
}

export function usePromiseFeedback(): PromiseFeedbackContextValue {
  const ctx = useContext(PromiseFeedbackContext);
  if (!ctx) {
    throw new Error('usePromiseFeedback must be used inside PromiseFeedbackProvider');
  }
  return ctx;
}
