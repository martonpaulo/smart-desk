export interface SyncStoreConfig {
  syncFromServer: () => Promise<void>;
  syncPending: () => Promise<void>;
  intervalMs: number;
  alwaysSync: boolean;
}
