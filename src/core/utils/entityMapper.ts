import { Base, RawBase } from '@/core/types/Base';

// maps id/user_id/trashed/created_at/updated_at
export function baseMapToDB<T extends Base>(entity: T, userId: string): RawBase {
  return {
    id: entity.id,
    user_id: userId,
    trashed: entity.trashed,
    created_at: entity.createdAt.toISOString(),
    updated_at: entity.updatedAt.toISOString(),
  };
}

// reverses the base fields and marks synced
export function baseMapFromDB<R extends RawBase>(
  raw: R,
): Omit<Base, 'isSynced'> & { isSynced: true } {
  return {
    id: raw.id,
    trashed: raw.trashed,
    createdAt: new Date(raw.created_at),
    updatedAt: new Date(raw.updated_at),
    isSynced: true,
  };
}
