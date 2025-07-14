import { create } from 'zustand';

export type SyncStatus = 'idle' | 'connected' | 'disconnected' | 'error';

interface SyncState {
  status: SyncStatus;
  setStatus: (status: SyncStatus) => void;
}

export const useSyncStatusStore = create<SyncState>(set => ({
  status: 'idle',
  setStatus: status => set({ status }),
}));
