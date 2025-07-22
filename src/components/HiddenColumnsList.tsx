import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';

import { useBoardStore } from '@/store/board/store';
import { useTodoPrefsStore } from '@/store/todoPrefsStore';

export function HiddenColumnsList() {
  const columns = useBoardStore(state => state.columns);
  const hiddenIds = useTodoPrefsStore(state => state.hiddenColumnIds);
  const toggleHidden = useTodoPrefsStore(state => state.toggleHiddenColumn);

  const hiddenColumns = columns.filter(c => !c.trashed && hiddenIds?.includes(c.id));

  if (hiddenColumns.length === 0) return null;

  return (
    <Accordion sx={{ boxShadow: 1 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h4">Hidden Columns</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <List dense disablePadding>
          {hiddenColumns.map(col => (
            <ListItem key={col.id} sx={{ pl: 0 }}>
              <ListItemText primary={col.title} sx={{ color: col.color }} />
              <IconButton edge="end" onClick={() => toggleHidden(col.id)}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </ListItem>
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
}
