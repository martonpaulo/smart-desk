'use client';

import { DescriptionOutlined as NotesIcon } from '@mui/icons-material';
import { Box, Chip, Stack, Typography, useTheme } from '@mui/material';

import { Event } from 'src/legacy/types/Event';
import { isPast, toLocalTimeString } from 'src/legacy/utils/timeUtils';

interface MonthEventCardProps {
  event: Event;
  onClick?: () => void;
}

export function MonthEventCard({ event, onClick }: MonthEventCardProps) {
  const theme = useTheme();

  const startTime = toLocalTimeString(event.start);
  const eventColor = event?.calendar?.color || theme.palette.primary.main;
  const isPastEvent = isPast(event.end);

  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={0.5}
      borderRadius={1}
      paddingX={0.25}
      paddingY={0.1}
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          backgroundColor: eventColor + '75',
          transform: 'translateY(-1px)',
          boxShadow: theme.shadows[1],
        },
      }}
      onClick={onClick}
    >
      {/* Event color dot */}
      <Box
        sx={{
          minWidth: 8,
          minHeight: 8,
          borderRadius: '50%',
          backgroundColor: isPastEvent ? eventColor + '75' : eventColor,
        }}
      />

      {event.allDay ? (
        <Chip
          label="unset"
          variant="outlined"
          size="small"
          sx={{
            fontSize: '0.5rem',
            height: 12,
            width: 'min-content',
            borderColor: isPastEvent ? 'text.disabled' : 'divider',
          }}
        />
      ) : (
        <Typography variant="caption" color={isPastEvent ? 'text.disabled' : 'text.secondary'}>
          {startTime}
        </Typography>
      )}

      <Stack direction="row" alignItems="center" gap={0.25} whiteSpace="nowrap" overflow="hidden">
        {event.description && (
          <NotesIcon color={isPastEvent ? 'disabled' : 'action'} sx={{ fontSize: '0.75rem' }} />
        )}

        <Typography variant="caption" color={isPastEvent ? 'text.disabled' : 'text.primary'}>
          {event.title}
        </Typography>
      </Stack>
    </Stack>
  );
}
