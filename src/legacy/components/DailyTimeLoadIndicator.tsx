import { Box, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import { isSameDay } from 'date-fns';

import { useBoardStore } from '@/legacy/store/board/store';
// import { useEventStore } from '@/legacy/store/eventStore';
// import { filterNonFullDayEvents, filterTodayEvents } from '@/legacy/utils/eventUtils';
import { parseSafeHtml } from '@/legacy/utils/textUtils';
import { getTimeLoadState } from '@/legacy/utils/timeLoadUtils';
import { formatFullDuration } from '@/shared/utils/timeUtils';

export function DailyTimeLoadIndicator() {
  const tasks = useBoardStore(state => state.tasks);
  // const events = useEventStore(state => state.events);

  const theme = useTheme();

  const today = new Date();
  // const now = new Date();

  // ---- Calculate total planned minutes for tasks ----
  const todaysTasks = tasks.filter(
    task => !task.trashed && task.plannedDate && isSameDay(task.plannedDate, today),
  );

  const taskMinutes = todaysTasks.reduce((total, task) => {
    const minutes = (task.estimatedTime ?? 0) * (task.quantityTarget ?? 1);
    return total + minutes;
  }, 0);

  const remainingTaskMinutes = todaysTasks
    .filter(task => task.quantityDone !== task.quantityTarget)
    .reduce((total, task) => {
      const minutes = (task.estimatedTime ?? 0) * (task.quantityTarget ?? 1);
      return total + minutes;
    }, 0);

  // // ---- Calculate total and remaining minutes for events ----
  // const todaysEvents = filterTodayEvents(filterNonFullDayEvents(events ?? []), today);

  // const eventMinutes = todaysEvents.reduce((total, event) => {
  //   const start = new Date(event.start).getTime();
  //   const end = new Date(event.end).getTime();
  //   const minutes = Math.max(0, Math.round((end - start) / 60000));
  //   return total + minutes;
  // }, 0);

  // const remainingEventMinutes = todaysEvents
  //   .filter(event => new Date(event.end).getTime() >= now.getTime())
  //   .reduce((total, event) => {
  //     const start = new Date(event.start).getTime();
  //     const end = new Date(event.end).getTime();
  //     const minutes = Math.max(0, Math.round((end - start) / 60000));
  //     return total + minutes;
  //   }, 0);

  // ---- Final aggregations ----
  // const totalMinutes = taskMinutes + eventMinutes;
  // const remainingMinutes = remainingTaskMinutes + remainingEventMinutes;

  const totalFormatted = formatFullDuration(taskMinutes * 60_000);
  const remainingFormatted = formatFullDuration(remainingTaskMinutes * 60_000);

  const { label, color, tooltip } = getTimeLoadState(taskMinutes);

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
        {remainingFormatted} / {totalFormatted}
      </Typography>
    </Stack>
  );
}
