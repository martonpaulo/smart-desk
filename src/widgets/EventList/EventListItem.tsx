import { Circle as StatusIcon } from '@mui/icons-material';
import { ListItem, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material';

import { MinutesChip } from '@/components/MinutesChip';
import { theme } from '@/styles/theme';
import { IEvent } from '@/types/IEvent';
import {
  calculateMinutesUntilEvent,
  computeEventStatus,
  formatEventTimeRange,
  getAttendeeCountLabel,
} from '@/utils/eventUtils';

interface EventListItemProps {
  event: IEvent;
}

export function EventListItem({ event }: EventListItemProps) {
  const { title, calendar, attendeeCount } = event;
  const isCurrent = computeEventStatus(event) === 'current';

  const iconColor = calendar?.color || theme.palette.primary.main;
  const attendeesLabel = getAttendeeCountLabel(event);
  const backgroundColor = isCurrent ? theme.palette.action.selected : 'inherit';

  const minutesUntilEvent = calculateMinutesUntilEvent(event);

  const shouldDisplayChip = isCurrent || (minutesUntilEvent > 0 && minutesUntilEvent < 30);

  return (
    <ListItem sx={{ backgroundColor, borderRadius: 1 }}>
      <ListItemIcon>
        <StatusIcon sx={{ color: iconColor }} />
      </ListItemIcon>

      <ListItemText>
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography variant="body2">{formatEventTimeRange(event)}</Typography>

          {shouldDisplayChip && <MinutesChip event={event} size="small" />}
        </Stack>

        <Typography variant="subtitle1">{title}</Typography>

        {attendeeCount !== undefined && attendeeCount > 0 && (
          <Typography variant="caption">{attendeesLabel}</Typography>
        )}
      </ListItemText>
    </ListItem>
  );
}
