import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { endOfDay, format, startOfDay } from 'date-fns';
import { useLocationsStore } from 'src/features/location/store/useLocationsStore';
import type { Location } from 'src/features/location/types/Location';

type UseLocationsByDateResult = {
  locations: Location[];
  isLoading: boolean;
  refetch: () => void;
};

function isDateInRange(target: Date, start: Date, end: Date) {
  const t0 = startOfDay(target).getTime();
  const s0 = startOfDay(start).getTime();
  const e1 = endOfDay(end).getTime();
  return s0 <= t0 && t0 <= e1;
}

export function useLocationsByDate(date: Date): UseLocationsByDateResult {
  const query = useQuery({
    queryKey: ['locations-by-date', format(date, 'yyyy-MM-dd')],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const items = useLocationsStore.getState().items;

      const filtered = items
        .filter(loc => !loc.trashed && isDateInRange(date, loc.startDate, loc.endDate))
        .sort((a, b) => {
          const byStart = a.startDate.getTime() - b.startDate.getTime();
          if (byStart !== 0) return byStart;
          const byEnd = a.endDate.getTime() - b.endDate.getTime();
          if (byEnd !== 0) return byEnd;
          return a.name.localeCompare(b.name);
        });

      return filtered;
    },
  });

  return {
    locations: query.data ?? [],
    isLoading: query.isLoading || query.isFetching,
    refetch: query.refetch,
  };
}
