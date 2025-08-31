'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useSnackbar } from 'notistack';

import { useConnectivityStore } from '@/core/store/useConnectivityStore';

// Public shape kept small for UI
export type UseSyncTriggerResult = {
  label: string; // text to show in the button
  canSync: boolean; // control disabled state
  trigger: () => void; // imperative trigger if needed elsewhere
};

type Options = {
  triggerKey?: number | string;
};

export function useSyncTrigger({ triggerKey }: Options = {}): UseSyncTriggerResult {
  const { enqueueSnackbar } = useSnackbar();

  // Only select primitives from the store
  const canSync = useConnectivityStore(s => s.canSync);
  const uiText = useConnectivityStore(s => s.uiText);

  const markSyncStart = useConnectivityStore(s => s.markSyncStart);
  const markSyncEnd = useConnectivityStore(s => s.markSyncEnd);

  const lastTriggeredRef = useRef<number>(0);
  const [label, setLabel] = useState<string>(uiText);

  useEffect(() => {
    setLabel(uiText);
  }, [uiText]);

  const runSync = useCallback(async () => {
    if (!canSync) {
      enqueueSnackbar('Sync not allowed now', { variant: 'info' });
      return;
    }

    const now = Date.now();
    // Small guard against accidental rapid double taps even if store says canSync
    if (now - lastTriggeredRef.current < 250) return;
    lastTriggeredRef.current = now;

    try {
      markSyncStart();
      setLabel('Syncing…');

      // Place your real sync here. Keep it short and resilient.
      // You can also inject a callback if needed.
      // Example:
      // await syncActiveFeatures();

      // Simulate a fast round trip if you don’t have a callback at hand
      await new Promise(res => setTimeout(res, 300));

      markSyncEnd(true);
      enqueueSnackbar('Synced', { variant: 'success' });
    } catch {
      markSyncEnd(false);
      enqueueSnackbar('Sync failed', { variant: 'error' });
    }
  }, [canSync, enqueueSnackbar, markSyncEnd, markSyncStart]);

  // Expose a stable API and reflect external triggerKey changes
  useEffect(() => {
    if (triggerKey === undefined) return;
    void runSync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerKey]);

  return useMemo(
    () => ({
      label,
      canSync,
      trigger: runSync,
    }),
    [label, canSync, runSync],
  );
}
