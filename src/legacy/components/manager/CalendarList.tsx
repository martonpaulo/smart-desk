import { Circle as StatusIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from '@mui/material';

import { IcsCalendar } from '@/legacy/types/icsCalendar';

interface CalendarListProps {
  calendars: IcsCalendar[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export function CalendarList({ calendars, onEdit, onDelete }: CalendarListProps) {
  console.log(calendars);

  if (calendars.length === 0) {
    return (
      <List dense disablePadding>
        <ListItem>
          <ListItemText primary="No calendars configured" />
        </ListItem>
      </List>
    );
  }

  return (
    <List dense disablePadding>
      {calendars.map((cal, idx) => (
        <ListItem key={cal.id} sx={{ pl: 0 }}>
          <ListItemIcon>
            <StatusIcon sx={{ color: cal.color }} />
          </ListItemIcon>
          <ListItemText
            primary={cal.title}
            secondary={cal.source}
            sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
          />
          <ListItemSecondaryAction>
            <IconButton edge="end" onClick={() => onEdit(idx)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton edge="end" onClick={() => onDelete(idx)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
}
