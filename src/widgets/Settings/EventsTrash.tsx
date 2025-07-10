import RestoreIcon from '@mui/icons-material/RestoreFromTrash';
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from '@mui/material';

import { useEventStore } from '@/store/eventStore';

export function EventsTrash() {
  const trash = useEventStore(state => state.trash);
  const restoreEvent = useEventStore(state => state.restoreEvent);

  return (
    <Box>
      <Typography variant="h3" gutterBottom>
        Deleted Events
      </Typography>
      <List dense>
        {trash.map(ev => (
          <ListItem key={ev.id} sx={{ pl: 0 }}>
            <ListItemText primary={ev.title} />
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="restore" onClick={() => restoreEvent(ev.id)}>
                <RestoreIcon fontSize="small" />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
        {trash.length === 0 && (
          <ListItem sx={{ pl: 0 }}>
            <ListItemText primary="Trash is empty" />
          </ListItem>
        )}
      </List>
    </Box>
  );
}
