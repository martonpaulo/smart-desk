import { Box, useTheme } from '@mui/material';

import { ITimelineEvent } from '@/widgets/EventTimeline/ITimelineEvent';

interface EventBarProps {
  event: ITimelineEvent;
  gapHeight: number;
  eventHeight: number;
  headerHeight: number;
}

export function EventBar({ event, gapHeight, eventHeight, headerHeight }: EventBarProps) {
  const { palette, shape } = useTheme();

  const barColor = () => {
    if (event.status === 'past') return palette.text.disabled;
    return event.calendar?.color || palette.primary.main;
  };

  const borderSizeRem = 0.1;

  const borderColor = () => {
    if (event.status === 'past') return `transparent`;
    if (event.status === 'current') return palette.warning.dark;
    return barColor();
  };

  const top = `${event.level * (gapHeight + eventHeight) + headerHeight}rem`;

  return (
    <Box
      sx={{
        position: 'absolute',
        left: `${event.startPosition}%`,
        width: `${event.width}%`,
        top,
        height: `${eventHeight - 2 * borderSizeRem}rem`,
        bgcolor: barColor,
        borderRadius: shape.borderRadius,
        borderWidth: `${borderSizeRem}rem`,
        borderStyle: 'solid',
        borderColor: borderColor,
        opacity: event.status === 'past' ? palette.action.disabledOpacity : 1,
      }}
    />
  );
}
