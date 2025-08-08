import { createSupabaseEntityAdapter } from '@/core/services/createSupabaseEntityAdapter';
import { createZustandEntityStore } from '@/core/store/zustandEntityStoreFactory';
import type { BaseType } from '@/core/types/BaseType';
import { isOnline } from '@/core/utils/syncHelpers';

interface SyncedEntityStoreConfig<E extends BaseType> {
  table: string;
  requiredFields?: Array<Exclude<keyof E, keyof BaseType>>;
  defaults?: Partial<Omit<E, keyof BaseType>>;
  dateFields?: Array<Exclude<keyof E, keyof BaseType>>;
  excludeFields?: Array<Exclude<keyof E, keyof BaseType>>;
  hasUser?: boolean;
  onConflict?: string;
}

export function createSyncedEntityStore<E extends BaseType>(cfg: SyncedEntityStoreConfig<E>) {
  const service = createSupabaseEntityAdapter<E>({
    table: cfg.table,
    dateFields: cfg.dateFields,
    excludeFields: cfg.excludeFields,
    hasUser: cfg.hasUser,
    onConflict: cfg.onConflict,
  });

  const store = createZustandEntityStore<E>({
    key: cfg.table,
    fetchAll: service.fetchAll,
    upsert: service.upsert,
    softDelete: service.softDelete,
    hardDelete: service.hardDelete,
    buildAddEntity: (data, id) => {
      if (!data.createdAt) throw new Error('Missing createdAt');
      if (cfg.requiredFields) {
        for (const f of cfg.requiredFields) {
          if (data[f] == null) throw new Error(`Missing ${String(f)}`);
        }
      }
      return {
        id,
        trashed: false,
        updatedAt: data.createdAt,
        isSynced: false,
        ...cfg.defaults,
        ...data,
      } as E;
    },
    buildUpdateEntity: (old, data) => {
      if (!data.updatedAt) throw new Error('Missing updatedAt');
      return {
        ...old,
        ...data,
        isSynced: false,
      };
    },
  });

  type Mutation = { op: 'add' | 'update' | 'delete'; payload: Partial<E>; ts: number };

  // Keep the queue outside Zustand state to avoid type conflicts
  let pendingMutations: Mutation[] = [];

  const enqueueMutation = (mutation: Mutation): void => {
    pendingMutations = [...pendingMutations, mutation];
  };

  const flushQueue = async (): Promise<void> => {
    if (!isOnline()) return;
    if (pendingMutations.length === 0) return;

    // Try to persist local pending items first
    await store.getState().syncPending();

    // If you want to actually replay 'pendingMutations' to the server,
    // do it here using your adapter. For now we clear after sync.
    pendingMutations = [];
  };

  const syncNow = async (): Promise<void> => {
    if (!isOnline()) return;
    await flushQueue();
    await store.getState().syncPending();
    await store.getState().syncFromServer();
  };

  // Attach helpers to the store object itself, not into Zustand state
  const augmented = Object.assign(store, {
    get pendingMutations() {
      return pendingMutations;
    },
    enqueueMutation,
    flushQueue,
    syncNow,
  }) as typeof store & {
    readonly pendingMutations: Mutation[];
    enqueueMutation: (mutation: Mutation) => void;
    flushQueue: () => Promise<void>;
    syncNow: () => Promise<void>;
  };

  return augmented;
}
