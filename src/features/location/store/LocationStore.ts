import type { SupabaseClient } from '@supabase/supabase-js';

import { createEntityStore, EntityState } from '@/core/store/genericEntityStore';
import { supabaseLocationsService } from '@/features/location/services/supabaseLocationService';
import { Location } from '@/features/location/types/Location';

export type LocationState = EntityState<Location>;

export const useLocationStore = createEntityStore<Location>({
  key: 'locations',
  fetchAll: (client: SupabaseClient) => supabaseLocationsService.fetchAll(client),
  upsert: (client: SupabaseClient, loc: Location) => supabaseLocationsService.upsert(client, loc),
  softDelete: (client: SupabaseClient, id: string) =>
    supabaseLocationsService.softDelete(client, id),
  hardDelete: (client: SupabaseClient, id: string) =>
    supabaseLocationsService.hardDelete(client, id),
  buildAddEntity,
  buildUpdateEntity,
});

function buildAddEntity(data: Partial<Location>, id: string) {
  if (!data.name || !data.type || !data.startDate || !data.endDate || !data.createdAt)
    throw new Error('Missing required fields');

  return {
    id,
    type: data.type,
    name: data.name.trim(),
    startDate: data.startDate,
    endDate: data.endDate,
    createdAt: data.createdAt,
    updatedAt: data.createdAt,
    isSynced: false,
  };
}

function buildUpdateEntity(old: Location, data: Partial<Location>) {
  if (!data.id || !data.updatedAt) throw new Error('Missing ID or updatedAt for update');

  return {
    ...old,
    type: data.type ?? old.type,
    name: data.name?.trim() ?? old.name,
    startDate: data.startDate ?? old.startDate,
    endDate: data.endDate ?? old.endDate,
    updatedAt: data.updatedAt,
    isSynced: false,
  };
}
