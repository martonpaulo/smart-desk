import { createSupabaseEntityService } from '@/core/services/supabaseEntityService';
import { Location } from '@/features/location/types/Location';
import { RawLocation } from '@/features/location/types/RawLocation';

export const supabaseLocationsService = createSupabaseEntityService<Location>({
  table: 'locations',
  mapToDB,
  mapFromDB,
});

function mapToDB(location: Location, userId: string): RawLocation {
  return {
    id: location.id,
    user_id: userId,
    type: location.type,
    name: location.name,
    start_date: location.startDate.toISOString(),
    end_date: location.endDate.toISOString(),
    updated_at: location.updatedAt.toISOString(),
    created_at: location.createdAt.toISOString(),
  };
}

function mapFromDB(db: unknown): Location {
  const rawLocation = db as RawLocation;

  return {
    id: rawLocation.id,
    type: rawLocation.type,
    name: rawLocation.name,
    startDate: new Date(rawLocation.start_date),
    endDate: new Date(rawLocation.end_date),
    updatedAt: new Date(rawLocation.updated_at),
    createdAt: new Date(rawLocation.created_at),
    isSynced: true, // Assuming isSynced is always true for fetched locations
  };
}
