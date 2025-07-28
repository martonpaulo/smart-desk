import { Box, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import { isSameDay } from 'date-fns';

import { useBoardStore } from '@/legacy/store/board/store';
import { useEventStore } from '@/legacy/store/eventStore';
import { filterNonFullDayEvents, filterTodayEvents } from '@/legacy/utils/eventUtils';
import { parseSafeHtml } from '@/legacy/utils/textUtils';
import { getTimeLoadState } from '@/legacy/utils/timeLoadUtils';
import { formatFullDuration } from '@/shared/utils/timeUtils';

export function DailyTimeLoadIndicator() {
  const tasks = useBoardStore(state => state.tasks);
  const events = useEventStore(state => state.events);

  const theme = useTheme();

  const today = new Date();

  // Sum estimated time of tasks planned for today
  const taskMinutes = tasks
    .filter(t => !t.trashed && t.plannedDate && isSameDay(t.plannedDate, today))
    .reduce((total, task) => total + (task.estimatedTime ?? 0) * (task.quantityTarget ?? 1), 0);

  // Filter and sum durations of non all-day events happening today
  const todaysEvents = filterTodayEvents(filterNonFullDayEvents(events ?? []), today);
  const eventMinutes = todaysEvents.reduce((total, event) => {
    const start = new Date(event.start).getTime();
    const end = new Date(event.end).getTime();
    const minutes = Math.max(0, Math.round((end - start) / 60000));
    return total + minutes;
  }, 0);

  const totalMinutes = taskMinutes + eventMinutes;
  const formatted = formatFullDuration(totalMinutes * 60_000);

  const { label, color, tooltip } = getTimeLoadState(totalMinutes);

  return (
    <Stack direction="column" spacing={0.5}>
      <Tooltip title={parseSafeHtml(tooltip)}>
        <Stack direction="row" gap={0.5} alignItems="center" sx={{ cursor: 'help' }}>
          <Box
            style={{
              width: theme.spacing(1.5),
              height: theme.spacing(1.5),
              borderRadius: '50%',
              backgroundColor: color,
            }}
          />

          <Typography variant="body2" color={color} fontWeight="bold">
            {label}
          </Typography>
        </Stack>
      </Tooltip>

      <Typography variant="body2" color={color}>
        {formatted}
      </Typography>
    </Stack>
  );
}
