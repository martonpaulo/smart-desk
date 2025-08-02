import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';

import { useTasks } from '@/legacy/hooks/useTasks';
import { useBoardStore } from '@/legacy/store/board/store';
import { useTodoPrefsStore } from '@/legacy/store/todoPrefsStore';
import { CountChip } from '@/shared/components/CountChip';

export function HiddenColumnsList() {
  const columns = useBoardStore(state => state.columns);
  const hiddenIds = useTodoPrefsStore(state => state.hiddenColumnIds);
  const toggleHidden = useTodoPrefsStore(state => state.toggleHiddenColumn);
  const tasks = useTasks({ plannedDate: new Date(), trashed: false });

  const taskCountByColumn = tasks.reduce(
    (acc, task) => {
      acc[task.columnId] = (acc[task.columnId] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const hiddenColumns = columns.filter(c => !c.trashed && hiddenIds?.includes(c.id));

  if (hiddenColumns.length === 0) return null;

  const handleUnhideAll = () => {
    hiddenColumns.forEach(col => toggleHidden(col.id));
  };

  return (
    <Accordion
      sx={{
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          minHeight: 50,
          '&.Mui-expanded': {
            minHeight: 50,
          },
          '& .MuiAccordionSummary-content': {
            marginY: 0.5,
            '&.Mui-expanded': {
              marginY: 0.5,
            },
          },
        }}
      >
        <Typography variant="h4">Hidden Columns</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack direction="row" justifyContent="flex-end">
          <Button size="small" onClick={handleUnhideAll} sx={{ p: 0, minWidth: 0 }}>
            Unhide All
          </Button>
        </Stack>
        <List dense disablePadding>
          {hiddenColumns.map(col => (
            <ListItem
              key={col.id}
              sx={{
                pl: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                '& .MuiListItemSecondaryAction-root': {
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                },
              }}
              secondaryAction={
                <IconButton edge="end" onClick={() => toggleHidden(col.id)} sx={{ p: 0, m: 0 }}>
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemText
                primary={
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ color: col.color, marginRight: 8 }}>{col.title}</span>
                    <CountChip count={taskCountByColumn[col.id] ?? 0} color={col.color} />
                  </span>
                }
              />
            </ListItem>
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
}
