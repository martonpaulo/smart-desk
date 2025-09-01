'use client';

import { AccessTime, Event as MaterialEvent } from '@mui/icons-material';
import { Box, Chip, Typography, useTheme } from '@mui/material';
import { Event } from 'src/legacy/types/Event';

interface EventCardProps {
  event: Event;
  compact?: boolean;
  minimal?: boolean;
  onClick?: () => void;
}

export function EventCard({ event, compact = false, minimal = false, onClick }: EventCardProps) {
  const theme = useTheme();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getEventDuration = () => {
    if (event.allDay) return 'All day';
    if (!event.end) return formatTime(event.start);

    const start = formatTime(event.start);
    const end = formatTime(event.end);
    return `${start} - ${end}`;
  };

  const eventColor = event?.calendar?.color || theme.palette.primary.main;

  if (minimal) {
    return (
      <Box
        sx={{
          backgroundColor: eventColor + '20',
          borderLeft: 3,
          borderColor: eventColor,
          p: 0.25,
          mb: 0.25,
          borderRadius: 0.5,
          cursor: onClick ? 'pointer' : 'default',
          '&:hover': onClick
            ? {
                backgroundColor: eventColor + '30',
              }
            : {},
        }}
        onClick={onClick}
      >
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.65rem',
            fontWeight: 500,
            color: 'text.primary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block',
          }}
        >
          {event.title}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: eventColor + '15',
        border: 1,
        borderColor: eventColor + '40',
        borderRadius: 1,
        p: compact ? 0.5 : 1,
        mb: compact ? 0.5 : 1,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        '&:hover': onClick
          ? {
              backgroundColor: eventColor + '25',
              transform: 'translateY(-1px)',
              boxShadow: theme.shadows[2],
            }
          : {},
      }}
      onClick={onClick}
    >
      {/* Event title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: compact ? 0 : 0.5 }}>
        <MaterialEvent sx={{ fontSize: compact ? 12 : 16, color: eventColor }} />
        <Typography
          variant={compact ? 'caption' : 'subtitle2'}
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}
        >
          {event.title}
        </Typography>
      </Box>

      {/* Event time */}
      {!compact && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          <AccessTime sx={{ fontSize: 12, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            {getEventDuration()}
          </Typography>
        </Box>
      )}

      {/* All day chip */}
      {compact && event.allDay && (
        <Chip
          label="All day"
          size="small"
          variant="outlined"
          sx={{
            fontSize: '0.6rem',
            height: 16,
            mt: 0.25,
          }}
        />
      )}

      {/* Event description */}
      {!compact && event.description && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {event.description}
        </Typography>
      )}
    </Box>
  );
}
