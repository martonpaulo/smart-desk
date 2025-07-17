import { Button, LinearProgress, Stack, Typography } from '@mui/material';

import { useBoardStore } from '@/store/board/store';
import { useTodoPrefsStore } from '@/store/todoPrefsStore';

export function TodoProgress() {
  const tasks = useBoardStore(state => state.tasks);
  const columns = useBoardStore(state => state.columns);
  const hideDoneColumn = useTodoPrefsStore(state => state.hideDoneColumn);
  const setHideDoneColumn = useTodoPrefsStore(state => state.setHideDoneColumn);

  const doneColumn = columns.find(c => !c.trashed && c.title === 'Done');
  const totalCount = tasks.filter(t => !t.trashed).length;
  const doneCount = doneColumn
    ? tasks.filter(t => !t.trashed && t.columnId === doneColumn.id).length
    : 0;

  const percentage = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  return (
    <Stack spacing={1}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h3" color="primary">
          Progress
        </Typography>
        {doneColumn && (
          <Button
            size="small"
            onClick={() => setHideDoneColumn(!hideDoneColumn)}
          >
            {hideDoneColumn ? 'Show Done' : 'Hide Done'}
          </Button>
        )}
      </Stack>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{ height: 10, borderRadius: 5 }}
      />
      <Typography variant="body2" textAlign="right">
        {percentage}% done
      </Typography>
    </Stack>
  );
}

