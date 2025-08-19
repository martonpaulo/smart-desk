'use client';

import { Stack } from '@mui/material';

import { Clock } from '@/legacy/components/Clock';
import { TodoList } from '@/legacy/components/column/TodoList';
import { EventList } from '@/legacy/components/event/EventList';
import { HiddenColumnsList } from '@/legacy/components/HiddenColumnsList';
import { EventTimeline } from '@/legacy/components/timeline/EventTimeline';
import { ConnectedChip } from '@/shared/components/ConnectedChip';
import { ProgressBarIndicator } from '@/shared/components/ProgressBarIndicator';
import SyncButton from '@/shared/components/SyncButton';
import { TimeLoadIndicator } from '@/shared/components/TimeLoadIndicator';
import { useResponsiveness } from '@/shared/hooks/useResponsiveness';

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

            {!isMobile && <HiddenColumnsList />}

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <ConnectedChip />
              <SyncButton />
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
