'use client';

import { useCallback, useEffect, useState } from 'react';

import { Box } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';

import { PageSection } from '@/core/components/PageSection';
import { CalendarView } from '@/features/calendar/types/CalendarView';
import { CalendarNavigation } from '@/legacy/components/calendar/CalendarNavigation';
import { CalendarViewContainer } from '@/legacy/components/calendar/CalendarViewContainer';
import { parseDateFromSlug } from '@/legacy/utils/dateSlug';
import { useResponsiveness } from '@/shared/hooks/useResponsiveness';

export default function CalendarPage() {
  const pathname = usePathname();
  const router = useRouter();

  const isMobile = useResponsiveness();
  // Parse the current date and view from the URL
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<CalendarView | null>(null);

  const navigateToDate = useCallback(
    (date: Date, view: CalendarView) => {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      let path = '/calendar';

      switch (view) {
        case 'schedule':
          path = '/calendar/schedule';
          break;
        case 'year':
          path = `/calendar/${year}`;
          break;
        case 'month':
          path = `/calendar/${year}/${month.toString().padStart(2, '0')}`;
          break;
        case 'day':
          path = `/calendar/${year}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;
          break;
        case 'week':
          path = `/calendar/${year}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/week`;
          break;
      }

      router.push(path);
    },
    [router],
  );

  useEffect(() => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const dateSegments = pathSegments.slice(1); // Remove 'calendar' from segments

    if (dateSegments.length === 0) {
      // Default to current month
      setCurrentDate(new Date());
      setCurrentView(isMobile ? 'schedule' : 'month');
      navigateToDate(new Date(), isMobile ? 'schedule' : 'month');
      return;
    }

    // Check for schedule view
    if (dateSegments[0] === 'schedule') {
      setCurrentView('schedule');
      return;
    }

    // Check for week view
    if (dateSegments[dateSegments.length - 1] === 'week') {
      setCurrentView('week');
      const dateOnlySegments = dateSegments.slice(0, -1);
      setCurrentDate(parseDateFromSlug(dateOnlySegments));
      return;
    }

    // Parse date and determine view
    const parsedDate = parseDateFromSlug(dateSegments);
    setCurrentDate(parsedDate);

    // Determine view based on URL structure
    if (dateSegments.length === 1) {
      setCurrentView('year');
    } else if (dateSegments.length === 2) {
      setCurrentView('month');
    } else if (dateSegments.length === 3) {
      setCurrentView('day');
    } else {
      setCurrentView(isMobile ? 'schedule' : 'month');
    }
  }, [pathname, isMobile, navigateToDate]);

  const handleViewChange = (newView: CalendarView) => {
    setCurrentView(newView);
    navigateToDate(currentDate, newView);
  };

  const handleDateChange = (newDate: Date) => {
    if (currentView) {
      setCurrentDate(newDate);
      navigateToDate(newDate, currentView);
    }
  };

  const getPageTitle = () => {
    switch (currentView) {
      case 'schedule':
        return 'Schedule';
      case 'year':
        return `${currentDate.getFullYear()}`;
      case 'month':
        return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'week':
        return `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'day':
        return currentDate.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      default:
        return 'Calendar';
    }
  };

  return (
    <PageSection title={getPageTitle()} hideTitle hideDescription>
      {currentView && (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <CalendarNavigation
            currentDate={currentDate}
            currentView={currentView}
            onDateChange={handleDateChange}
            onViewChange={handleViewChange}
            onNavigate={navigateToDate}
          />

          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <CalendarViewContainer
              currentDate={currentDate}
              currentView={currentView}
              onDateChangeAction={handleDateChange}
              onViewChangeAction={handleViewChange}
              onNavigateAction={navigateToDate}
            />
          </Box>
        </Box>
      )}
    </PageSection>
  );
}
