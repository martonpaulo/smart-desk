'use client';

import { useMemo,useState } from 'react';

import { Box, Tab,Tabs } from '@mui/material';
import { endOfDay, endOfMonth, endOfWeek, endOfYear,startOfDay, startOfMonth, startOfWeek, startOfYear } from 'date-fns';

import { PageContentLayout } from '@/components/PageContentLayout';
import { useEvents } from '@/hooks/useEvents';
import { useEventStore } from '@/store/eventStore';
import { BigCalendar, CalendarViewType, YearView } from '@/widgets/EventCalendar';

export default function CalendarPage() {
  const [view, setView] = useState<CalendarViewType | 'year'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

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

  return (
    <PageContentLayout title="Calendar" description="Your events in one place">
      <Tabs value={view} onChange={handleViewChange} sx={{ mb: 2 }}>
        <Tab label="Day" value="day" />
        <Tab label="Week" value="week" />
        <Tab label="Month" value="month" />
        <Tab label="Year" value="year" />
      </Tabs>
      {view === 'year' ? (
        <YearView date={currentDate} onChange={setCurrentDate} />
      ) : (
        <Box>
          <BigCalendar
            events={events}
            date={currentDate}
            view={view}
            onNavigate={setCurrentDate}
            onViewChange={setView}
          />
        </Box>
      )}
    </PageContentLayout>
  );
}
