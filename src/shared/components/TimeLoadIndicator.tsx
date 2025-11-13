import { Stack, Tooltip, Typography } from '@mui/material';

import { useTasks } from 'src/legacy/hooks/useTasks';
import { parseSafeHtml } from 'src/legacy/utils/textUtils';
import { CircleBox } from 'src/shared/components/CircleBox';
import { resolveTimeLoadState } from 'src/shared/utils/timeLoadUtils';
import { formatFullDuration } from 'src/shared/utils/timeUtils';

export function TimeLoadIndicator() {
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
    <Tooltip title={parseSafeHtml(tooltip)}>
      <Stack spacing={1} sx={{ cursor: 'pointer' }}>
        <Stack direction="row" gap={0.5} alignItems="center" height={16}>
          <CircleBox color={color} size={1.5} />

          <Typography variant="body2" color={color} fontWeight="bold" lineHeight={1}>
            {label}
          </Typography>
        </Stack>

        <Typography variant="body2" color={color} lineHeight={1} height={16}>
          {completedDurationFormatted} / {totalDurationFormatted}
        </Typography>
      </Stack>
    </Tooltip>
  );
}
