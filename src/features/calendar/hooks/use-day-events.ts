import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { db } from '@/db/powersync';
import { getDayEvents } from '@/features/calendar/logic/get-day-events';

const NOW_TICK_MS = 60_000;
const DB_CONNECTION_POLL_MS = 500;

function getDayBoundaries(date: Date): { dayStartIso: string; dayEndIso: string } {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  return {
    dayStartIso: dayStart.toISOString(),
    dayEndIso: dayEnd.toISOString(),
  };
}

export function useDayEvents() {
  const [now, setNow] = useState(() => new Date());
  const [isDbConnected, setIsDbConnected] = useState(() => db.connected);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, NOW_TICK_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setIsDbConnected(previous => (previous === db.connected ? previous : db.connected));
    }, DB_CONNECTION_POLL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const boundaries = useMemo(() => getDayBoundaries(now), [now]);

  return useQuery({
    queryKey: ['calendar-events-day', boundaries.dayStartIso],
    queryFn: () => getDayEvents(boundaries),
    enabled: isDbConnected,
    refetchInterval: NOW_TICK_MS,
  });
}
