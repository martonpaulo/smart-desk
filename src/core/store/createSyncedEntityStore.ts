import { createSupabaseEntityAdapter } from '@/core/services/createSupabaseEntityAdapter';
import { createZustandEntityStore } from '@/core/store/zustandEntityStoreFactory';
import type { BaseType } from '@/core/types/BaseType';

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

  return createZustandEntityStore<E>({
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
}
