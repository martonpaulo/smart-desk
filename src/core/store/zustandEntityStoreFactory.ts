import type { SupabaseClient } from '@supabase/supabase-js';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getSupabaseClient } from '@/legacy/lib/supabaseClient';
import { mergeById } from '@/legacy/utils/boardHelpers';
import { buildStorageKey } from '@/legacy/utils/localStorageUtils';

export interface EntityState<E extends { id: string; updatedAt: Date; isSynced?: boolean }> {
  items: E[];
  pending: E[];
  add(data: Partial<E>): Promise<string>;
  update(data: Partial<E> & { id: string }): Promise<void>;
  softDelete?(id: string): Promise<void>;
  restore?(id: string): Promise<void>;
  hardDelete?(id: string): Promise<void>;
  syncPending(): Promise<void>;
  syncFromServer(): Promise<void>;
}

interface Config<E extends { id: string; updatedAt: Date; isSynced?: boolean }> {
  key: string;
  fetchAll(client: SupabaseClient): Promise<E[]>;
  upsert(client: SupabaseClient, item: E): Promise<E>;
  softDelete?(client: SupabaseClient, id: string): Promise<void>;
  restore?(client: SupabaseClient, id: string): Promise<void>;
  hardDelete?(client: SupabaseClient, id: string): Promise<void>;
  buildAddEntity(data: Partial<E>, id: string): E;
  buildUpdateEntity(old: E, data: Partial<E>): E;
}

export function createZustandEntityStore<
  E extends { id: string; updatedAt: Date; isSynced?: boolean },
>(cfg: Config<E>) {
  return create<EntityState<E>>()(
    persist(
      (set, get) => {
        const add = async (data: Partial<E>): Promise<string> => {
          const id = crypto.randomUUID();
          const entity = cfg.buildAddEntity(data, id);
          set(state => ({
            items: [...state.items, entity],
            pending: [...state.pending, entity],
          }));
          void get().syncPending();
          return id;
        };

        const update = async (data: Partial<E> & { id: string }): Promise<void> => {
          const old = get().items.find(item => item.id === data.id);
          if (!old) return;
          const updated = cfg.buildUpdateEntity(old, data);
          set(state => ({
            items: state.items.map(item => (item.id === data.id ? updated : item)),
            pending: [...state.pending.filter(item => item.id !== data.id), updated],
          }));
          await get().syncPending();
        };

        const softDeleteFn = cfg.softDelete
          ? async (id: string): Promise<void> => {
              set(state => ({
                items: state.items.filter(item => item.id !== id),
                pending: state.pending.filter(item => item.id !== id),
              }));
              try {
                await cfg.softDelete!(getSupabaseClient(), id);
              } catch {
                // optionally requeue or log
                console.error(`Failed to soft delete item with id ${id}`);
              }
            }
          : undefined;

        const restoreFn = cfg.restore
          ? async (id: string): Promise<void> => {
              set(state => ({
                items: state.items.filter(item => item.id !== id),
                pending: state.pending.filter(item => item.id !== id),
              }));
              try {
                await cfg.restore!(getSupabaseClient(), id);
              } catch {
                // optionally requeue or log
                console.error(`Failed to restore item with id ${id}`);
              }
            }
          : undefined;

        const hardDeleteFn = cfg.hardDelete
          ? async (id: string): Promise<void> => {
              set(state => ({
                items: state.items.filter(item => item.id !== id),
                pending: state.pending.filter(item => item.id !== id),
              }));
              try {
                await cfg.hardDelete!(getSupabaseClient(), id);
              } catch {
                // optionally requeue or log
                console.error(`Failed to hard delete item with id ${id}`);
              }
            }
          : undefined;

        const syncPending = async (): Promise<void> => {
          const client = getSupabaseClient();
          const pendingItems = get().pending;
          const still: E[] = [];
          for (const item of pendingItems) {
            try {
              const saved = await cfg.upsert(client, item);
              set(state => ({
                items: state.items.map(i => (i.id === saved.id ? saved : i)),
              }));
            } catch {
              still.push(item);
            }
          }
          set({ pending: still });
        };

        const syncFromServer = async (): Promise<void> => {
          const client = getSupabaseClient();
          try {
            const remote = await cfg.fetchAll(client);
            const merged = mergeById(get().items, remote);
            set({
              items: merged,
              pending: merged.filter(item => !item.isSynced),
            });
          } catch {
            // fetch failed
            console.error('Failed to sync from server');
          }
        };

        return {
          items: [],
          pending: [],
          add,
          update,
          syncPending,
          syncFromServer,
          ...(softDeleteFn && { softDelete: softDeleteFn }),
          ...(restoreFn && { restore: restoreFn }),
          ...(hardDeleteFn && { hardDelete: hardDeleteFn }),
        };
      },
      {
        name: buildStorageKey(cfg.key),
        storage: createJSONStorage(() => localStorage),
      },
    ),
  );
}
