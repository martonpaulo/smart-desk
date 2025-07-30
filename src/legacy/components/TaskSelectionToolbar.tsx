import { useState } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from '@mui/material';

import type { TaskSelectAction } from '@/features/task/types/TaskSelectAction';
import { QuantitySelector } from '@/legacy/components/QuantitySelector';
import { formatDuration, parseDuration } from '@/legacy/utils/timeUtils';

export interface TaskSelectionToolbarProps {
  totalCount: number;
  selectedCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onApply: (actions: {
    important: TaskSelectAction;
    urgent: TaskSelectAction;
    blocked: TaskSelectAction;
    daily: TaskSelectAction;
    trashed: TaskSelectAction;
    done: TaskSelectAction;
    plannedDate: Date | null;
    estimatedTime: number | null;
  }) => void;
  onCancel: () => void;
}

export function TaskSelectionToolbar({
  totalCount,
  selectedCount,
  onSelectAll,
  onDeselectAll,
  onApply,
  onCancel,
}: TaskSelectionToolbarProps) {
  const theme = useTheme();
  const noneSelected = selectedCount === 0;
  const allSelected = selectedCount === totalCount;

  // tri‑state toggles
  const [important, setImportant] = useState<TaskSelectAction>('none');
  const [urgent, setUrgent] = useState<TaskSelectAction>('none');
  const [blocked, setBlocked] = useState<TaskSelectAction>('none');
  const [daily, setDaily] = useState<TaskSelectAction>('none');
  const [trashed, setTrashed] = useState<TaskSelectAction>('none');
  const [done, setDone] = useState<TaskSelectAction>('none');

  // date picker
  const [dateValue, setDateValue] = useState<string>('');

  // quantity selector
  const [timeValue, setTimeValue] = useState<number | null>(null);

  const anyAction =
    important !== 'none' ||
    urgent !== 'none' ||
    blocked !== 'none' ||
    daily !== 'none' ||
    trashed !== 'none' ||
    done !== 'none' ||
    dateValue !== '' ||
    timeValue !== null;

  const resetForm = () => {
    setImportant('none');
    setUrgent('none');
    setBlocked('none');
    setDaily('none');
    setTrashed('none');
    setDone('none');
    setDateValue('');
    setTimeValue(null);
  };

  const openModal = () => {
    resetForm();
    setModalOpen(true);
  };
  const closeModal = () => {
    resetForm();
    setModalOpen(false);
  };
  const handleApply = () => {
    onApply({
      important,
      urgent,
      blocked,
      daily,
      trashed,
      done,
      plannedDate: dateValue ? new Date(dateValue) : null,
      estimatedTime: timeValue,
    });
    closeModal();
  };

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          position: 'sticky',
          bottom: 0,
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          backgroundColor: theme.palette.background.paper,
          zIndex: theme.zIndex.appBar,
        }}
      >
        <Stack direction="row" gap={1} alignItems="center" justifyContent="space-between">
          <span>{selectedCount} selected</span>
          <Stack direction="row" gap={1} alignItems="center">
            <Button size="small" variant="outlined" onClick={onSelectAll} disabled={allSelected}>
              Select All
            </Button>
            <Button size="small" variant="outlined" onClick={onDeselectAll} disabled={noneSelected}>
              Deselect All
            </Button>
            <Button size="small" variant="contained" onClick={openModal} disabled={noneSelected}>
              Bulk Edit
            </Button>
            <Button size="small" variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Dialog open={modalOpen} onClose={closeModal} fullWidth maxWidth="mobileMd">
        <DialogTitle>Bulk Edit Tasks</DialogTitle>
        <DialogContent>
          <Stack gap={2} sx={{ mt: 1 }}>
            {[
              { label: 'Important', state: important, setter: setImportant },
              { label: 'Urgent', state: urgent, setter: setUrgent },
              { label: 'Blocked', state: blocked, setter: setBlocked },
              { label: 'Daily', state: daily, setter: setDaily },
              { label: 'Trashed', state: trashed, setter: setTrashed },
              { label: 'Done', state: done, setter: setDone },
            ].map(({ label, state, setter }) => (
              <Stack
                key={label}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                gap={1}
              >
                <span>{label}</span>
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={state}
                  onChange={(_, v) => setter(v || 'none')}
                  aria-label={label}
                >
                  <ToggleButton value="set" aria-label={`set-${label}`} color="primary">
                    Mark
                  </ToggleButton>

                  <ToggleButton value="clear" aria-label={`clear-${label}`} color="error">
                    Clear
                  </ToggleButton>
                  <ToggleButton value="none" aria-label={`none-${label}`}>
                    None
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            ))}

            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
              <span>Date</span>
              <TextField
                type="date"
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
                value={dateValue}
                onChange={e => setDateValue(e.target.value)}
              />
            </Stack>

            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
              <span>Time</span>
              <Stack direction="row" gap={1} alignItems="center">
                <Button size="small" onClick={() => setTimeValue(null)}>
                  Clear
                </Button>
                <QuantitySelector
                  value={timeValue}
                  placeholder="not set"
                  onValueChange={v => setTimeValue(v)}
                  step={20}
                  minValue={1}
                  maxValue={480}
                  formatFn={formatDuration}
                  parseFn={parseDuration}
                />
              </Stack>
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeModal}>Cancel</Button>
          <Button variant="contained" disabled={!anyAction} onClick={handleApply}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
