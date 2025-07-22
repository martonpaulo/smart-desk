'use client';

import { useEffect, useMemo, useState } from 'react';

import { Box, Tab, Tabs } from '@mui/material';
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns';
import { useRouter } from 'next/navigation';

import { PageContentLayout } from '@/components/PageContentLayout';
import { useEvents } from '@/hooks/useEvents';
import { useEventStore } from '@/store/eventStore';
import { parseDateFromSlug } from '@/utils/dateSlug';
import { BigCalendar, CalendarViewType, YearView } from '@/widgets/EventCalendar';

interface CalendarPageProps {
  params: { date?: string[] };
}

export default function CalendarPage({ params }: CalendarPageProps) {
  const [view, setView] = useState<CalendarViewType | 'year'>('month');
  const initialDate = useMemo(() => parseDateFromSlug(params.date), [params.date]);
  const [currentDate, setCurrentDate] = useState(initialDate);
  const router = useRouter();

  useEffect(() => {
    setCurrentDate(initialDate);
  }, [initialDate]);

  const { start, end } = useMemo(() => {
    switch (view) {
      case 'day':
        return { start: startOfDay(currentDate), end: endOfDay(currentDate) };
      case 'week':
        return { start: startOfWeek(currentDate), end: endOfWeek(currentDate) };
      case 'month':
        return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };
      case 'year':
      default:
        return { start: startOfYear(currentDate), end: endOfYear(currentDate) };
    }
  }, [view, currentDate]);

  useEvents(start, end);
  const events = useEventStore(s => s.events);

  const handleViewChange = (_: unknown, value: string) => {
    setView(value as CalendarViewType | 'year');
  };

  const navigateToDate = (date: Date) => {
    setCurrentDate(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    let path = `/calendar/${year}`;
    if (view !== 'year') path += `/${month}`;
    if (view === 'day') path += `/${day}`;
    router.push(path);
  };

  return (
    <PageContentLayout title="Calendar" description="Your events in one place">
      <Tabs value={view} onChange={handleViewChange} sx={{ mb: 2 }}>
        <Tab label="Day" value="day" />
        <Tab label="Week" value="week" />
        <Tab label="Month" value="month" />
        <Tab label="Year" value="year" />
      </Tabs>
      {view === 'year' ? (
        <YearView date={currentDate} onChange={navigateToDate} />
      ) : (
        <Box>
          <BigCalendar
            events={events}
            date={currentDate}
            view={view}
            onNavigate={navigateToDate}
            onViewChange={setView}
          />
        </Box>
      )}
    </PageContentLayout>
  );
}
