'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useSnackbar } from 'notistack';
import { useConnectivityStore } from 'src/core/store/useConnectivityStore';

// Global state to track snackbar initialization and prevent first-load notifications
let globalSnackbarInitialized = false;
let globalLastNotificationStatus = '';

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
  const isConnected = useConnectivityStore(s => s.isConnected);
  const online = useConnectivityStore(s => s.online);
  const supabaseStatus = useConnectivityStore(s => s.supabaseStatus);
  const authStatus = useConnectivityStore(s => s.authStatus);

  const markSyncStart = useConnectivityStore(s => s.markSyncStart);
  const markSyncEnd = useConnectivityStore(s => s.markSyncEnd);

  const lastTriggeredRef = useRef<number>(0);
  const [label, setLabel] = useState<string>(uiText);

  useEffect(() => {
    setLabel(uiText);
  }, [uiText]);

  // Monitor connectivity changes and show appropriate notifications
  useEffect(() => {
    const currentStatus = `${online}-${authStatus}-${supabaseStatus}-${isConnected}`;

    // On first run globally, capture the initial status without showing snackbars
    if (!globalSnackbarInitialized) {
      globalLastNotificationStatus = currentStatus;
      globalSnackbarInitialized = true;
      return;
    }

    // Skip if this is the same status we already notified about
    if (currentStatus === globalLastNotificationStatus) return;

    // Store the previous status before updating
    const previousStatus = globalLastNotificationStatus;
    globalLastNotificationStatus = currentStatus;

    // Show notifications for meaningful connectivity changes
    // Only show snackbars for significant state changes, not initial app load

    if (!online) {
      // Always show when going offline (from any online state)
      enqueueSnackbar('No internet connection', {
        variant: 'error',
        autoHideDuration: 5000,
        preventDuplicate: true,
      });
    } else if (supabaseStatus === 'expired') {
      // Show when session expires (from connected state)
      enqueueSnackbar('Session expired. Please sign in again.', {
        variant: 'warning',
        autoHideDuration: 7000,
        preventDuplicate: true,
      });
    } else if (supabaseStatus === 'error') {
      // Show when connection error occurs (from connected state)
      enqueueSnackbar('Connection error. Retrying...', {
        variant: 'error',
        autoHideDuration: 5000,
        preventDuplicate: true,
      });
    } else if (supabaseStatus === 'disconnected') {
      // Show when reconnecting (from error/expired state)
      enqueueSnackbar('Reconnecting...', {
        variant: 'info',
        autoHideDuration: 3000,
        preventDuplicate: true,
      });
    } else if (isConnected && supabaseStatus === 'connected') {
      // Show success if we were previously disconnected, error, or expired
      const wasDisconnected =
        previousStatus.includes('disconnected') ||
        previousStatus.includes('error') ||
        previousStatus.includes('expired');

      if (wasDisconnected) {
        enqueueSnackbar('Connected successfully', {
          variant: 'success',
          autoHideDuration: 3000,
          preventDuplicate: true,
        });
      }
    }
  }, [online, authStatus, supabaseStatus, isConnected, enqueueSnackbar]);

  const runSync = useCallback(async () => {
    if (!canSync) {
      // Get more specific error message from connectivity store
      const store = useConnectivityStore.getState();
      let message = 'Sync not available';

      if (!store.online) {
        message = 'No internet connection';
      } else if (store.authStatus === 'unauthenticated') {
        message = 'Please sign in to sync';
      } else if (store.supabaseStatus === 'expired') {
        message = 'Session expired. Please sign in again.';
      } else if (store.supabaseStatus === 'error') {
        message = 'Connection error. Please try again.';
      } else if (store.supabaseStatus === 'disconnected') {
        message = 'Reconnecting... Please wait.';
      } else if (store.syncPhase === 'syncing') {
        message = 'Sync already in progress';
      } else if (store.cooldownUntil && Date.now() < store.cooldownUntil) {
        message = 'Please wait before syncing again';
      }

      enqueueSnackbar(message, {
        variant: 'info',
        autoHideDuration: 4000,
        preventDuplicate: true,
      });
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

      // Simulate a fast round trip if you don't have a callback at hand
      await new Promise(res => setTimeout(res, 300));

      markSyncEnd(true);
      enqueueSnackbar('Synced successfully', {
        variant: 'success',
        autoHideDuration: 3000,
        preventDuplicate: true,
      });
    } catch (error) {
      markSyncEnd(false);
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      enqueueSnackbar(`Sync failed: ${errorMessage}`, {
        variant: 'error',
        autoHideDuration: 5000,
        preventDuplicate: true,
      });
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
