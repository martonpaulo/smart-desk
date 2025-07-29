export function defineSync<
  T extends { syncFromServer: () => Promise<void>; syncPending: () => Promise<void> },
>(store: { getState: () => T }, intervalMs: number) {
  const state = store.getState();
  return {
    syncFromServer: state.syncFromServer,
    syncPending: state.syncPending,
    intervalMs,
  };
}
