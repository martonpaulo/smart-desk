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

  // queue of mutations performed while offline
  type Mutation = { op: 'add' | 'update' | 'delete'; payload: Partial<E>; ts: number };

  store.setState(state => ({ ...(state as object), pendingMutations: [] }));

  const enqueueMutation = (mutation: Mutation): void => {
    console.info('enqueue mutation', mutation);
    store.setState(state => ({
      ...(state as { pendingMutations: Mutation[] }),
      pendingMutations: [...(state as { pendingMutations: Mutation[] }).pendingMutations, mutation],
    }));
  };

  const flushQueue = async (): Promise<void> => {
    if (!isOnline()) return;
    const queue = (store.getState() as { pendingMutations: Mutation[] }).pendingMutations;
    if (queue.length === 0) return;
    // In this simplified implementation we just clear the queue after attempting syncPending
    await store.getState().syncPending();
    store.setState(state => ({ ...(state as object), pendingMutations: [] }));
  };

  const syncNow = async (): Promise<void> => {
    if (!isOnline()) return;
    await flushQueue();
    await store.getState().syncPending();
    await store.getState().syncFromServer();
  };

  store.setState(state => ({
    ...(state as object),
    enqueueMutation,
    flushQueue,
    syncNow,
  }));

  return store as typeof store & {
    pendingMutations: Mutation[];
    enqueueMutation: (mutation: Mutation) => void;
    flushQueue: () => Promise<void>;
    syncNow: () => Promise<void>;
  };
}
