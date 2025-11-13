'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// Auth status reported by next-auth
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

// Supabase session status for more granular tracking
export type SupabaseStatus = 'loading' | 'connected' | 'disconnected' | 'expired' | 'error';

// High-level sync phase for UI and scheduling
export type SyncPhase = 'idle' | 'syncing' | 'cooldown';

// Icon keys to keep UI mapping simple and testable
export type UiIcon = 'sync' | 'cloudDone' | 'cloudOff' | 'cloudError' | 'cloudWarning';

// UI color key for status indication in components
export type UiColor = 'info' | 'error';

// Connection error types for better user feedback
export type ConnectionError = 'network' | 'session_expired' | 'auth_failed' | 'server_error' | null;

// 15 seconds cooldown as requested
const COOLDOWN_MS = 15_000;

interface ConnectivityState {
  // Auth and network
  authStatus: AuthStatus;
  supabaseStatus: SupabaseStatus;
  online: boolean;

  // Sync state
  syncPhase: SyncPhase;
  cooldownUntil: number | null; // epoch ms when cooldown ends
  lastSyncAt: number | null; // epoch ms of last successful sync
  hasPendingSync: boolean; // app-level pending writes
  lastError: ConnectionError; // last connection error
  lastErrorAt: number | null; // when the last error occurred

  // Stable derived primitives for UI and flow control
  isConnected: boolean; // online && authenticated && supabase connected
  canSync: boolean; // connected && not syncing && no cooldown
  uiIcon: UiIcon; // stable primitive, not a function
  uiColor: UiColor; // stable primitive, not a function
  uiText: string; // stable primitive, not a function

  // Actions
  setAuthStatus: (status: AuthStatus) => void;
  setSupabaseStatus: (status: SupabaseStatus) => void;
  setOnline: (online: boolean) => void;
  setHasPendingSync: (pending: boolean) => void;
  setConnectionError: (error: ConnectionError) => void;

  markSyncStart: () => void;
  markSyncEnd: (ok: boolean) => void;
  setCooldownUntil: (when: number | null) => void;

  // Internal recompute helper
  _recompute: () => void;
}

function computeDerived(
  s: ConnectivityState,
): Pick<ConnectivityState, 'isConnected' | 'canSync' | 'uiIcon' | 'uiColor' | 'uiText'> {
  // More comprehensive connection check
  const isConnected =
    s.online && s.authStatus === 'authenticated' && s.supabaseStatus === 'connected';

  const now = Date.now();
  const inCooldown = s.cooldownUntil != null && now < s.cooldownUntil;
  const canSync = isConnected && s.syncPhase !== 'syncing' && !inCooldown;

  // Enhanced UI mapping with better error states
  let uiIcon: UiIcon = 'cloudOff';
  let uiText = 'Offline';
  let uiColor: UiColor = 'error';

  if (!s.online) {
    uiIcon = 'cloudOff';
    uiText = 'No internet';
    uiColor = 'error';
  } else if (s.authStatus === 'loading' || s.supabaseStatus === 'loading') {
    uiIcon = 'sync';
    uiText = 'Connecting…';
    uiColor = 'info';
  } else if (s.authStatus === 'unauthenticated') {
    uiIcon = 'cloudWarning';
    uiText = 'Not signed in';
    uiColor = 'error';
  } else if (s.supabaseStatus === 'expired') {
    uiIcon = 'cloudError';
    uiText = 'Session expired';
    uiColor = 'error';
  } else if (s.supabaseStatus === 'error') {
    uiIcon = 'cloudError';
    uiText = 'Connection error';
    uiColor = 'error';
  } else if (s.supabaseStatus === 'disconnected') {
    uiIcon = 'cloudWarning';
    uiText = 'Reconnecting…';
    uiColor = 'error';
  } else if (s.syncPhase === 'syncing') {
    uiIcon = 'sync';
    uiText = 'Syncing…';
    uiColor = 'info';
  } else if (inCooldown) {
    uiIcon = 'cloudDone';
    uiText = 'Synced';
    uiColor = 'info';
  } else if (s.hasPendingSync) {
    uiIcon = 'cloudWarning';
    uiText = 'Pending changes';
    uiColor = 'error';
  } else if (isConnected) {
    uiIcon = 'cloudDone';
    uiText = 'Up to date';
    uiColor = 'info';
  } else {
    // Fallback for unexpected states
    uiIcon = 'cloudWarning';
    uiText = 'Unknown status';
    uiColor = 'error';
  }

  return { isConnected, canSync, uiIcon, uiColor, uiText };
}

export const useConnectivityStore = create<ConnectivityState>()(
  subscribeWithSelector((set, get) => {
    return {
      // Base state
      authStatus: 'loading',
      supabaseStatus: 'loading',
      online: false,

      syncPhase: 'idle',
      cooldownUntil: null,
      lastSyncAt: null,
      hasPendingSync: false,
      lastError: null,
      lastErrorAt: null,

      // Derived (seed with defaults, then recompute)
      isConnected: false,
      canSync: false,
      uiIcon: 'cloudOff',
      uiColor: 'error',
      uiText: 'Offline',

      // Actions
      setAuthStatus: status => {
        set({ authStatus: status }, false);
        get()._recompute();
      },
      setSupabaseStatus: status => {
        set({ supabaseStatus: status }, false);
        get()._recompute();
      },
      setOnline: online => {
        set({ online }, false);
        get()._recompute();
      },
      setHasPendingSync: pending => {
        set({ hasPendingSync: pending }, false);
        get()._recompute();
      },
      setConnectionError: error => {
        set(
          {
            lastError: error,
            lastErrorAt: error ? Date.now() : null,
          },
          false,
        );
        get()._recompute();
      },

      markSyncStart: () => {
        // Enter syncing; derived will flip uiIcon and canSync accordingly
        set({ syncPhase: 'syncing' }, false);
        get()._recompute();
      },

      markSyncEnd: ok => {
        const next: Partial<ConnectivityState> = {
          syncPhase: 'idle',
        };
        if (ok) {
          next.lastSyncAt = Date.now();
          next.cooldownUntil = Date.now() + COOLDOWN_MS;
          // Clear errors on successful sync
          next.lastError = null;
          next.lastErrorAt = null;
        }
        set(next, false);
        get()._recompute();
      },

      setCooldownUntil: when => {
        set({ cooldownUntil: when }, false);
        get()._recompute();
      },

      _recompute: () => {
        const s = get();
        const derived = computeDerived(s);
        set(derived, false);
      },
    };
  }),
);
