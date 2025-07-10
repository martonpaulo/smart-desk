import { Circle as StatusIcon } from '@mui/icons-material';
import { ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material';

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
        px: 1.5,
        py: shouldDisplayChip ? 1 : 0.5,
        mb: 0.5,
        position: 'relative',
      }}
    >
      <ListItemIcon sx={{ minWidth: 0, mr: 1.5 }}>
        <StatusIcon sx={{ color: iconColor, fontSize: '1.25rem' }} />
      </ListItemIcon>

      <ListItemText>
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography variant="caption">{formatEventTimeRange(event)}</Typography>

          {shouldDisplayChip && <MinutesChip event={event} size="small" />}
        </Stack>

        <Typography variant="body2">{title}</Typography>
      </ListItemText>
    </ListItemButton>
  );
}
