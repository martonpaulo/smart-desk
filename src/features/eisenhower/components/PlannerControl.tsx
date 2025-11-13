'use client';

import { Button, Stack, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { PropsWithChildren } from 'react';

type PlannerControlsProps = {
  isSelecting: boolean;
  toggleSelectingAction: () => void;
  showFuture: boolean;
  setShowFutureAction: (v: boolean) => void;
  showEvents: boolean;
  setShowEventsAction: (v: boolean) => void;
  rightSlot?: React.ReactNode;
};

export function PlannerControls({
  isSelecting,
  toggleSelectingAction,
  showFuture,
  setShowFutureAction,
  showEvents,
  setShowEventsAction,
  rightSlot,
}: PropsWithChildren<PlannerControlsProps>) {
  // keep ToggleButtonGroup logic compact and accessible
  return (
    <Stack direction="row" gap={2} mb={2} alignItems="center" justifyContent="space-between">
      <Stack gap={2} direction="row" alignItems="center">
        <Button variant={isSelecting ? 'contained' : 'outlined'} onClick={toggleSelectingAction}>
          {isSelecting ? 'Cancel Selection' : 'Select Tasks'}
        </Button>

        <ToggleButtonGroup
          size="small"
          value={[showFuture ? 'future' : null, showEvents ? 'events' : null].filter(Boolean)}
          onChange={(_, newValues: string[]) => {
            setShowFutureAction(newValues.includes('future'));
            setShowEventsAction(newValues.includes('events'));
          }}
          color="secondary"
        >
          <Tooltip title={showFuture ? 'Showing today and future' : 'Showing only today'}>
            <ToggleButton value="future" aria-label="Toggle future tasks">
              {showFuture ? 'Include Upcoming' : 'Hide Upcoming'}
            </ToggleButton>
          </Tooltip>

          <Tooltip title={showEvents ? 'Showing all-day events' : 'Hiding all-day events'}>
            <ToggleButton value="events" aria-label="Toggle all-day events">
              {showEvents ? 'Include Events' : 'Hide Events'}
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>
      </Stack>

      {rightSlot as React.ReactNode}
    </Stack>
  );
}
