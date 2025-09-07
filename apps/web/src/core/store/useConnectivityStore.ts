'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// Auth status reported by next-auth
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

// High-level sync phase for UI and scheduling
export type SyncPhase = 'idle' | 'syncing' | 'cooldown';

// Icon keys to keep UI mapping simple and testable
export type UiIcon = 'sync' | 'cloudDone' | 'cloudOff';

// 15 seconds cooldown as requested
const COOLDOWN_MS = 15_000;

interface ConnectivityState {
  // Auth and network
  authStatus: AuthStatus;
  online: boolean;

  // Sync state
  syncPhase: SyncPhase;
  cooldownUntil: number | null; // epoch ms when cooldown ends
  lastSyncAt: number | null; // epoch ms of last successful sync
  hasPendingSync: boolean; // app-level pending writes

  // Stable derived primitives for UI and flow control
  isConnected: boolean; // online && authenticated
  canSync: boolean; // connected && not syncing && no cooldown
  uiIcon: UiIcon; // stable primitive, not a function
  uiText: string; // stable primitive, not a function

  // Actions
  setAuthStatus: (status: AuthStatus) => void;
  setOnline: (online: boolean) => void;
  setHasPendingSync: (pending: boolean) => void;

  markSyncStart: () => void;
  markSyncEnd: (ok: boolean) => void;
  setCooldownUntil: (when: number | null) => void;

  // Internal recompute helper
  _recompute: () => void;
}

function computeDerived(
  s: ConnectivityState,
): Pick<ConnectivityState, 'isConnected' | 'canSync' | 'uiIcon' | 'uiText'> {
  const isConnected = s.online && s.authStatus === 'authenticated';

  const now = Date.now();
  const inCooldown = s.cooldownUntil != null && now < s.cooldownUntil;
  const canSync = isConnected && s.syncPhase !== 'syncing' && !inCooldown;

  // UI mapping as pure logic, returns only primitives
  let uiIcon: UiIcon = 'cloudOff';
  if (!isConnected) {
    uiIcon = 'cloudOff';
  } else if (s.syncPhase === 'syncing') {
    uiIcon = 'sync';
  } else {
    uiIcon = 'cloudDone';
  }

  // Keep text short and status-like
  const uiText = !isConnected
    ? 'Offline'
    : s.syncPhase === 'syncing'
      ? 'Syncing…'
      : inCooldown
        ? 'Synced'
        : s.hasPendingSync
          ? 'Pending changes'
          : 'Up to date';

  return { isConnected, canSync, uiIcon, uiText };
}

export const useConnectivityStore = create<ConnectivityState>()(
  subscribeWithSelector((set, get) => ({
    // Base state
    authStatus: 'loading',
    online: false,

    syncPhase: 'idle',
    cooldownUntil: null,
    lastSyncAt: null,
    hasPendingSync: false,

    // Derived (seed with defaults, then recompute)
    isConnected: false,
    canSync: false,
    uiIcon: 'cloudOff',
    uiText: 'Offline',

    // Actions
    setAuthStatus: status => {
      set({ authStatus: status }, false);
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
  })),
);
