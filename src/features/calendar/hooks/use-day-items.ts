import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { getDayItems } from '@/features/calendar/logic/get-day-items';

const DAY_ITEMS_REFRESH_INTERVAL_MS = 10_000;

function getDayWindowBoundaries(date: Date): { dayStartIso: string; dayEndIso: string } {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  return {
    dayStartIso: dayStart.toISOString(),
    dayEndIso: dayEnd.toISOString(),
  };
}

export function useDayItems() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, DAY_ITEMS_REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const boundaries = useMemo(() => getDayWindowBoundaries(now), [now]);

  return useQuery({
    queryKey: ['calendar-items-day', boundaries.dayStartIso],
    queryFn: () => getDayItems(boundaries),
    refetchInterval: DAY_ITEMS_REFRESH_INTERVAL_MS,
  });
}
