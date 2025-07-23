'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';

import { Box, CircularProgress } from '@mui/material';
import { useVirtualizer } from '@tanstack/react-virtual';

import { ScheduleDay } from '@/components/calendar/ScheduleDay';
import { useEvents } from '@/hooks/useEvents';
import { useEventStore } from '@/store/eventStore';
import { Event } from '@/types/Event';
import { endOfDay, startOfDay } from '@/utils/dateRange';

interface ScheduleViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onViewChange: (view: 'day' | 'week' | 'month' | 'year' | 'schedule') => void;
  onNavigate: (date: Date, view: 'day' | 'week' | 'month' | 'year' | 'schedule') => void;
}

export function ScheduleView({ onNavigate }: ScheduleViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rangeStart, setRangeStart] = useState(() => startOfDay(new Date()));
  const [rangeEnd, setRangeEnd] = useState(() => endOfDay(new Date()));

  const { isLoading } = useEvents(rangeStart, rangeEnd);
  const events = useEventStore(state => state.events);

  const [days, setDays] = useState<Date[]>([]);

  useEffect(() => {
    const list: Date[] = [];
    const cur = new Date(rangeStart);
    while (cur <= rangeEnd) {
      list.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    setDays(list);
  }, [rangeStart, rangeEnd]);

  const loadPrevDay = useCallback(() => {
    setRangeStart(prev => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 1);
      return startOfDay(next);
    });
  }, []);

  const loadNextDay = useCallback(() => {
    setRangeEnd(prev => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 1);
      return endOfDay(next);
    });
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: days.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 250,
    overscan: 2,
  });

  useEffect(() => {
    const items = rowVirtualizer.getVirtualItems();
    const first = items[0];
    if (first && first.index < 2) loadPrevDay();
    const last = items[items.length - 1];
    if (last && last.index > days.length - 3) loadNextDay();
  }, [rowVirtualizer, days.length, loadPrevDay, loadNextDay]);

  const handleEventClick = (event: Event) => {
    const date = new Date(event.start);
    onNavigate(date, 'day');
  };

  const grouped = (date: Date) =>
    events.filter(e => startOfDay(e.start).getTime() === startOfDay(date).getTime());

  return (
    <Box ref={containerRef} sx={{ height: '100%', overflow: 'auto' }}>
      <AutoSizer disableWidth>{({ height }) => (
        <Box sx={{ height }}>
          <Box style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
            {rowVirtualizer.getVirtualItems().map(item => (
              <Box
                key={item.key}
                ref={rowVirtualizer.measureElement}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${item.start}px)` }}
              >
                <ScheduleDay date={days[item.index]} events={grouped(days[item.index])} onSelect={handleEventClick} />
              </Box>
            ))}
            {isLoading && (
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={20} />
              </Box>
            )}
          </Box>
        </Box>
      )}</AutoSizer>
    </Box>
  );
}
