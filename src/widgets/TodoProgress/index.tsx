import { LinearProgress, Stack, StackProps, Typography } from '@mui/material';

import { useBoardStore } from '@/store/board/store';
import { defaultColumns } from '@/widgets/TodoList/defaultColumns';

export function TodoProgress(props: StackProps) {
  const tasks = useBoardStore(state => state.tasks);
  const columns = useBoardStore(state => state.columns);

  const doneColumn = columns.find(c => !c.trashed && c.title === defaultColumns.done.title);
  const totalCount = tasks.filter(t => !t.trashed).length;
  const doneCount = doneColumn
    ? tasks.filter(t => !t.trashed && t.columnId === doneColumn.id).length
    : 0;

  const percentage = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  // Determine styles based on percentage ranges
  const getStylesForPercentage = (percent: number) => {
    if (percent < 30)
      return {
        color: 'error.main',
        fontWeight: 'normal',
        label: 'Just Started',
      };
    if (percent < 60)
      return {
        color: 'warning.main',
        fontWeight: 'medium',
        label: 'In Progress',
      };
    if (percent < 90)
      return {
        color: 'info.main',
        fontWeight: 'bold',
        label: 'Almost There',
      };
    return {
      color: 'success.main',
      fontWeight: 'bold',
      label: 'Great Job!',
    };
  };

  const styles = getStylesForPercentage(percentage);

  return (
    <Stack spacing={1} {...props}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
        <Typography variant="body2" color={styles.color} fontWeight={styles.fontWeight}>
          {styles.label}
        </Typography>
        <Typography variant="h4" color={styles.color}>
          {doneCount} of {totalCount} ({percentage}%)
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 12,
          borderRadius: 2,
          bgcolor: 'rgba(0,0,0,0.05)',
          '& .MuiLinearProgress-bar': {
            backgroundColor: styles.color,
            transition: 'transform 0.4s ease, background-color 0.4s ease',
          },
        }}
      />
    </Stack>
  );
}
