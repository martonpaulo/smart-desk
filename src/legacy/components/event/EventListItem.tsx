import { Circle as StatusIcon } from '@mui/icons-material';
import {
  alpha,
  darken,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';

import { MinutesChip } from 'src/legacy/components/MinutesChip';
import { Event } from 'src/legacy/types/Event';
import {
  calculateMinutesUntilEvent,
  computeEventStatus,
  formatEventTimeRange,
} from 'src/legacy/utils/eventUtils';
import { theme } from 'src/theme';

interface EventListItemProps {
  event: Event;
  onClick: () => void;
  color?: string;
}

export function EventListItem({
  event,
  onClick,
  color = theme.palette.primary.light,
}: EventListItemProps) {
  const { title, calendar } = event;
  const isCurrent = computeEventStatus(event) === 'current';

  const iconColor = calendar?.color || theme.palette.primary.main;

  const minutesUntilEvent = calculateMinutesUntilEvent(event);
  const shouldDisplayChip = isCurrent || (minutesUntilEvent > 0 && minutesUntilEvent < 60);

  let backgroundColor: string;

  if (isCurrent) {
    backgroundColor = alpha(darken(color, 0.2), 0.55);
  } else if (minutesUntilEvent > 0 && minutesUntilEvent < 60) {
    backgroundColor = alpha(darken(color, 0.2), 0.125);
  } else {
    backgroundColor = alpha(darken(color, 0.2), 0);
  }

  const fontColor = theme.palette.text.primary;

  return (
    <ListItemButton
      onClick={onClick}
      sx={{
        backgroundColor,
        borderRadius: 1,
        px: 1.5,
        py: 1,
        mb: 0.75,
        position: 'relative',
        boxShadow: shouldDisplayChip ? `0 1px 3px ${alpha(darken(color, 0.1), 0.1)}` : 'none',
      }}
    >
      <ListItemIcon sx={{ minWidth: 0, mr: 1.5 }}>
        <StatusIcon
          sx={{
            color: iconColor,
            fontSize: '1.25rem',
          }}
        />
      </ListItemIcon>

      <ListItemText>
        <Stack direction="row" alignItems="center" gap={1} mb={0.25}>
          <Typography variant="caption" color={fontColor}>
            {formatEventTimeRange(event)}
          </Typography>

          {shouldDisplayChip && <MinutesChip event={event} size="small" />}
        </Stack>

        <Typography variant="h4" color={fontColor}>
          {title}
        </Typography>
      </ListItemText>
    </ListItemButton>
  );
}
