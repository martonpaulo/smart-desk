import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { useBoardStore } from '@/store/board/store';
import { useEventStore } from '@/store/eventStore';
import { filterNonFullDayEvents, filterTodayEvents } from '@/utils/eventUtils';
import { formatDuration, isSameDay } from '@/utils/timeUtils';

export function DailyTimeLoadIndicator() {
  const tasks = useBoardStore(state => state.tasks);
  const events = useEventStore(state => state.events);
  const { palette } = useTheme();

  const today = new Date();

  // Sum estimated time of tasks planned for today
  const taskMinutes = tasks
    .filter(t => !t.trashed && isSameDay(t.plannedDate, today))
    .reduce((total, task) => total + (task.estimatedTime ?? 0), 0);

  // Filter and sum durations of non all-day events happening today
  const todaysEvents = filterTodayEvents(filterNonFullDayEvents(events ?? []), today);
  const eventMinutes = todaysEvents.reduce((total, event) => {
    const start = new Date(event.start).getTime();
    const end = new Date(event.end).getTime();
    const minutes = Math.max(0, Math.round((end - start) / 60000));
    return total + minutes;
  }, 0);

  const totalMinutes = taskMinutes + eventMinutes;
  const formatted = formatDuration(totalMinutes);

  // choose color based on total planned time
  let color: string = 'success.main';
  if (totalMinutes > 8 * 60) color = 'grey.800';
  else if (totalMinutes > 6 * 60) color = 'error.main';
  else if (totalMinutes > 4 * 60) color = 'warning.main';

  return (
    <Tooltip title="Includes all planned tasks and timed events for today">
      <Box
        sx={{
          border: `1px solid ${palette.divider}`,
          borderRadius: 1,
          px: 1,
          py: 0.5,
        }}
      >
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Typography variant="body2" color={color}>
            {`\u{1F552} ${formatted} planned today`}
          </Typography>
        </Stack>
      </Box>
    </Tooltip>
  );
}
