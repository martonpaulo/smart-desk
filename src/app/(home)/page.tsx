'use client';

import { Stack } from '@mui/material';

import { ExportTasksButton } from 'src/features/task/components/ExportTasksButton';
import { Clock } from 'src/legacy/components/Clock';
import { TodoList } from 'src/legacy/components/column/TodoList';
import { EventList } from 'src/legacy/components/event/EventList';
import { HiddenColumnsList } from 'src/legacy/components/HiddenColumnsList';
import { EventTimeline } from 'src/legacy/components/timeline/EventTimeline';
import { ProgressBarIndicator } from 'src/shared/components/ProgressBarIndicator';
import { TimeLoadIndicator } from 'src/shared/components/TimeLoadIndicator';
import { useResponsiveness } from 'src/shared/hooks/useResponsiveness';

export default function BoardPage() {
  const isMobile = useResponsiveness();

  return (
    <Stack gap={2}>
      {!isMobile && (
        <Stack direction="row" justifyContent="space-between" gap={2} alignItems="center">
          <EventTimeline />
          <Clock />
        </Stack>
      )}

      <Stack
        spacing={2}
        direction={isMobile ? 'column-reverse' : 'row'}
        alignItems={isMobile ? 'stretch' : 'flex-start'}
        justifyContent="space-between"
      >
        <TodoList showDate={false} />

        <Stack alignItems="flex-start">
          <Stack spacing={2} width="100%">
            <Stack direction="row" gap={2} justifyContent="space-between" alignItems="center">
              <TimeLoadIndicator />
              <ProgressBarIndicator />
            </Stack>

            <EventList />

            {!isMobile && (
              <Stack spacing={2}>
                <HiddenColumnsList />
                <ExportTasksButton />
              </Stack>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
