import { Circle as StatusIcon } from '@mui/icons-material';
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';

import { MinutesChip } from '@/components/MinutesChip';
import { theme } from '@/styles/theme';
import { IEvent } from '@/types/IEvent';
import {
  calculateMinutesUntilEvent,
  computeEventStatus,
  formatEventTimeRange,
} from '@/utils/eventUtils';

interface EventListItemProps {
  event: IEvent;
  onClick: () => void;
}

export function EventListItem({ event, onClick }: EventListItemProps) {
  const { title, calendar } = event;
  const isCurrent = computeEventStatus(event) === 'current';

  const iconColor = calendar?.color || theme.palette.primary.main;
  const backgroundColor = isCurrent ? theme.palette.action.selected : 'inherit';

  const minutesUntilEvent = calculateMinutesUntilEvent(event);

  const shouldDisplayChip = isCurrent || (minutesUntilEvent > 0 && minutesUntilEvent < 30);

  return (
    <ListItemButton
      onClick={onClick}
      sx={{
        backgroundColor,
        borderRadius: 1,
        mb: 0.5,
        position: 'relative',
      }}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>
        <StatusIcon sx={{ color: iconColor }} />
      </ListItemIcon>

      <ListItemText>
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography variant="body2">{formatEventTimeRange(event)}</Typography>

          {shouldDisplayChip && <MinutesChip event={event} size="small" />}
        </Stack>

        <Typography variant="subtitle1">{title}</Typography>
      </ListItemText>
    </ListItemButton>
  );
}
