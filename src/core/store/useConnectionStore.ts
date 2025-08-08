import { create } from 'zustand';

interface ConnectionState {
  online: boolean;
  setOnline(online: boolean): void;
}

export const useConnectionStore = create<ConnectionState>(set => ({
  online: true,
  setOnline: (online: boolean) => set({ online }),
}));
