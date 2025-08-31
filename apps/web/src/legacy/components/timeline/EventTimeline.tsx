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
import { useCurrentTime } from '@/shared/hooks/useCurrentTime';

const PAST_WINDOW_HOURS = 3;
const FUTURE_WINDOW_HOURS = 6;

export function EventTimeline() {
  const { palette } = useTheme();

  const now = useCurrentTime();

  const startTime = new Date(now);
  startTime.setHours(startTime.getHours() - PAST_WINDOW_HOURS);

  const endTime = new Date(now);
  endTime.setHours(endTime.getHours() + FUTURE_WINDOW_HOURS);

  const { data: events } = useCombinedEvents(startTime, endTime);

  if (!events || events.length === 0) {
    return (
      <Box
        sx={theme => ({
          opacity: 0.5,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          p: 2,
          flexGrow: 1,
        })}
      >
        <Typography align="center" variant="body2">
          No events to display.
        </Typography>
      </Box>
    );
  }

  const rowGapRem = 0.25;
  const rowHeightRem = 0.75;
  const headerHeightRem = 1.5;

  // filter and level events
  const filteredEvents = events.filter(e => !e.allDay);
  const leveledEvents = layoutTimelineEvents(
    filteredEvents,
    now,
    PAST_WINDOW_HOURS,
    FUTURE_WINDOW_HOURS,
  );

  // compute container height
  const totalLevels = Math.max(1, ...leveledEvents.map(event => event.level + 1));
  const containerHeightRem = (rowGapRem + rowHeightRem) * totalLevels + headerHeightRem;

  // time indicators
  const hourlyMarkers = generateHourlyIndicators(now, PAST_WINDOW_HOURS, FUTURE_WINDOW_HOURS);
  const currentMarkerPos = calculateCurrentTimePercentage(PAST_WINDOW_HOURS, FUTURE_WINDOW_HOURS);

  return (
    <Box
      sx={{
        backgroundColor: palette.background.default,
        border: `1px solid ${palette.divider}`,
        overflow: 'hidden',
        borderRadius: 1,
        flexGrow: 1,
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
