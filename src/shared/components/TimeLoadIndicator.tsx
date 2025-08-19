import { Box, Stack, Tooltip, Typography, useTheme } from '@mui/material';

import { useTasks } from '@/legacy/hooks/useTasks';
import { parseSafeHtml } from '@/legacy/utils/textUtils';
import { resolveTimeLoadState } from '@/shared/utils/timeLoadUtils';
import { formatFullDuration } from '@/shared/utils/timeUtils';

export function TimeLoadIndicator() {
  const theme = useTheme();

  const allTasks = useTasks({
    plannedDate: new Date(),
    trashed: false,
    classified: true,
    estimated: true,
  });

  const doneTasks = useTasks({
    plannedDate: new Date(),
    trashed: false,
    done: true,
    classified: true,
    estimated: true,
  });

  const allTaskMinutes = allTasks.reduce((total, task) => {
    const minutes = (task.estimatedTime ?? 0) * (task.quantityTarget ?? 1);
    return total + minutes;
  }, 0);

  const doneTaskMinutes = doneTasks.reduce((total, task) => {
    const minutes = (task.estimatedTime ?? 0) * (task.quantityTarget ?? 1);
    return total + minutes;
  }, 0);

  const totalDurationFormatted = formatFullDuration(allTaskMinutes * 60_000);
  const completedDurationFormatted = formatFullDuration(doneTaskMinutes * 60_000);

  const { label, color, tooltip } = resolveTimeLoadState(allTaskMinutes);

  return (
    <Stack direction="column" spacing={0.5}>
      <Tooltip title={parseSafeHtml(tooltip)}>
        <Stack direction="row" gap={0.5} alignItems="center" sx={{ cursor: 'help' }}>
          <Box
            sx={{
              width: theme.spacing(1.5),
              height: theme.spacing(1.5),
              borderRadius: '50%',
              bgcolor: color,
            }}
          />
          <Typography variant="body2" color={color} fontWeight="bold">
            {label}
          </Typography>
        </Stack>
      </Tooltip>

      <Typography variant="body2" color={color}>
        {completedDurationFormatted} / {totalDurationFormatted}
      </Typography>
    </Stack>
  );
}
