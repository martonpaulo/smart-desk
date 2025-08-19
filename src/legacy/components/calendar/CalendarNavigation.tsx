'use client';

import { useState } from 'react';

import { ChevronLeft, ChevronRight, MoreVert } from '@mui/icons-material';
import { Box, Button, ButtonGroup, IconButton, Menu, MenuItem, Typography } from '@mui/material';

import { CalendarView } from '@/features/calendar/types/CalendarView';
import { useResponsiveness } from '@/shared/hooks/useResponsiveness';

interface CalendarNavigationProps {
  currentDate: Date;
  currentView: CalendarView;
  onDateChangeAction: (date: Date) => void;
  onViewChangeAction: (view: CalendarView) => void;
  onNavigate: (date: Date, view: CalendarView) => void;
}

export function CalendarNavigation({
  currentDate,
  currentView,
  onDateChangeAction,
  onViewChangeAction,
}: CalendarNavigationProps) {
  const isMobile = useResponsiveness();
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);

  const views: { value: CalendarView; label: string }[] = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
    { value: 'schedule', label: 'Schedule' },
  ];

  const getNavigationDate = (direction: 'prev' | 'next'): Date => {
    const newDate = new Date(currentDate);

    switch (currentView) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
      case 'schedule':
        // For schedule view, navigate by week
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
    }

    return newDate;
  };

  const handleNavigation = (direction: 'prev' | 'next') => {
    const newDate = getNavigationDate(direction);
    onDateChangeAction(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    onDateChangeAction(today);
  };

  const handleViewChange = (view: CalendarView) => {
    onViewChangeAction(view);
    setMobileMenuAnchor(null);
  };

  const getDateRangeText = () => {
    switch (currentView) {
      case 'year':
        return currentDate.getFullYear().toString();
      case 'month':
        return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'week': {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
          return `${startOfWeek.toLocaleDateString('en-US', { month: 'long' })} ${startOfWeek.getDate()}-${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
        } else {
          return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        }
      }
      case 'day':
        return currentDate.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      case 'schedule':
        return 'Schedule';
      default:
        return '';
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pb: 2,
        borderBottom: 1,
        borderColor: 'divider',
        flexWrap: 'wrap',
        gap: 1,
      }}
    >
      {/* Left side - Navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={() => handleNavigation('prev')} size="small">
          <ChevronLeft />
        </IconButton>

        <Button onClick={handleToday} size="small" title="Today">
          Today
        </Button>

        <IconButton onClick={() => handleNavigation('next')} size="small">
          <ChevronRight />
        </IconButton>
      </Box>

      {/* Center - Date Range */}
      <Typography
        variant="h3"
        sx={{
          fontWeight: 500,
          textAlign: 'center',
          minWidth: 0,
          flex: isMobile ? '1 1 100%' : '0 1 auto',
          order: isMobile ? 3 : 0,
        }}
      >
        {getDateRangeText()}
      </Typography>

      {/* Right side - View Selector */}
      {isMobile ? (
        <>
          <IconButton onClick={e => setMobileMenuAnchor(e.currentTarget)} size="small">
            <MoreVert />
          </IconButton>
          <Menu
            anchorEl={mobileMenuAnchor}
            open={Boolean(mobileMenuAnchor)}
            onClose={() => setMobileMenuAnchor(null)}
          >
            {views.map(view => (
              <MenuItem
                key={view.value}
                onClick={() => handleViewChange(view.value)}
                selected={currentView === view.value}
              >
                {view.label}
              </MenuItem>
            ))}
          </Menu>
        </>
      ) : (
        <ButtonGroup size="small" variant="outlined">
          {views.map(view => (
            <Button
              key={view.value}
              onClick={() => handleViewChange(view.value)}
              variant={currentView === view.value ? 'contained' : 'outlined'}
            >
              {view.label}
            </Button>
          ))}
        </ButtonGroup>
      )}
    </Box>
  );
}
