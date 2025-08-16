import { Box, Typography, useTheme } from '@mui/material';

import { CurrentIndicator } from '@/legacy/components/timeline/CurrentIndicator';
import { EventBar } from '@/legacy/components/timeline/EventBar';
import { TimeIndicator } from '@/legacy/components/timeline/TimeIndicator';
import { useCombinedEvents } from '@/legacy/hooks/useCombinedEvents';
import {
  calculateCurrentTimePercentage,
  formatHourLabel,
  generateHourlyIndicators,
  layoutTimelineEvents,
} from '@/legacy/utils/timelineUtils';

interface EventTimelineProps {
  currentTime: Date;
  pastWindowHours: number;
  futureWindowHours: number;
}

export function EventTimeline({
  currentTime,
  pastWindowHours,
  futureWindowHours,
}: EventTimelineProps) {
  const { palette } = useTheme();

  const startTime = new Date(currentTime);
  startTime.setHours(startTime.getHours() - pastWindowHours);

  const endTime = new Date(currentTime);
  endTime.setHours(endTime.getHours() + futureWindowHours);

  const { data: events } = useCombinedEvents(startTime, endTime);

  if (!events || events.length === 0) {
    return (
      <Box
        sx={theme => ({
          opacity: 0.5,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          p: 2,
        })}
      >
        <Typography align="center" variant="body2">
          No events to display.
        </Typography>
      </Box>
    );
  }

  const now = new Date(currentTime);

  const rowGapRem = 0.25;
  const rowHeightRem = 0.75;
  const headerHeightRem = 1.5;

  // filter and level events
  const filteredEvents = events.filter(e => !e.allDay);
  const leveledEvents = layoutTimelineEvents(
    filteredEvents,
    now,
    pastWindowHours,
    futureWindowHours,
  );

  // compute container height
  const totalLevels = Math.max(1, ...leveledEvents.map(event => event.level + 1));
  const containerHeightRem = (rowGapRem + rowHeightRem) * totalLevels + headerHeightRem;

  // time indicators
  const hourlyMarkers = generateHourlyIndicators(now, pastWindowHours, futureWindowHours);
  const currentMarkerPos = calculateCurrentTimePercentage(pastWindowHours, futureWindowHours);

  return (
    <Box
      sx={{
        backgroundColor: palette.background.default,
        border: `1px solid ${palette.divider}`,
        overflow: 'hidden',
        borderRadius: 1,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          height: `${containerHeightRem}rem`,

          margin: `${2 * rowGapRem}rem`,
        }}
      >
        {hourlyMarkers.map(marker => (
          <TimeIndicator
            key={marker.hourOfDay}
            position={marker.relativePosition}
            time={formatHourLabel(marker.hourOfDay)}
          />
        ))}

        <CurrentIndicator position={currentMarkerPos} />

        {leveledEvents.map(event => (
          <EventBar
            key={event.id}
            event={event}
            gapHeight={rowGapRem}
            eventHeight={rowHeightRem}
            headerHeight={headerHeightRem}
          />
        ))}
      </Box>
    </Box>
  );
}
