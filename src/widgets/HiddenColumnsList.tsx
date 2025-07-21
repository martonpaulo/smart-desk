import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';

import { useBoardStore } from '@/store/board/store';
import { useTodoPrefsStore } from '@/store/todoPrefsStore';

export function HiddenColumnsList() {
  const columns = useBoardStore(state => state.columns);
  const hiddenIds = useTodoPrefsStore(state => state.hiddenColumnIds);
  const toggleHidden = useTodoPrefsStore(state => state.toggleHiddenColumn);

  const hiddenColumns = columns.filter(
    c => !c.trashed && hiddenIds.includes(c.id),
  );

  if (hiddenColumns.length === 0) return null;

  return (
    <Stack spacing={1}>
      <Typography variant="h3">Hidden Columns</Typography>
      <List dense disablePadding>
        {hiddenColumns.map(col => (
          <ListItem key={col.id} sx={{ pl: 0 }}>
            <ListItemText primary={col.title} sx={{ color: col.color }} />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => toggleHidden(col.id)}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
