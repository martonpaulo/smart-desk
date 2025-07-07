import { Circle as StatusIcon, Delete } from '@mui/icons-material';
import {
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';

import { MinutesChip } from '@/components/MinutesChip';
import { useEventStore } from '@/store/eventStore';
import { showUndo } from '@/store/undoStore';
import { theme } from '@/styles/theme';
import { IEvent } from '@/types/IEvent';
import {
  calculateMinutesUntilEvent,
  computeEventStatus,
  formatEventTimeRange,
} from '@/utils/eventUtils';

interface EventListItemProps {
  event: IEvent;
  onDelete: (id: string) => void;
}

export function EventListItem({ event, onDelete }: EventListItemProps) {
  const { title, calendar } = event;
  const isCurrent = computeEventStatus(event) === 'current';

  const iconColor = calendar?.color || theme.palette.primary.main;
  const backgroundColor = isCurrent ? theme.palette.action.selected : 'inherit';

  const minutesUntilEvent = calculateMinutesUntilEvent(event);

  const shouldDisplayChip = isCurrent || (minutesUntilEvent > 0 && minutesUntilEvent < 30);

  return (
    <ListItem
      sx={{
        backgroundColor,
        borderRadius: 1,
        mb: 0.5,
        position: 'relative',
        '&:hover .delete-btn': { visibility: 'visible' },
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
      <ListItemSecondaryAction>
        <IconButton
          className="delete-btn"
          edge="end"
          aria-label="delete"
          onClick={() => {
            onDelete(event.id);
            showUndo('Event deleted', () => useEventStore.getState().restoreEvent(event.id));
          }}
          sx={{ visibility: 'hidden' }}
        >
          <Delete fontSize="small" />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
}
