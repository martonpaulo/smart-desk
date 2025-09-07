import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from '@mui/material';
import { TagLabel } from 'src/features/tag/components/TagLabel';
import { useTagsStore } from 'src/features/tag/store/useTagsStore';
import type { BulkTaskActions } from 'src/features/task/hooks/useBulkTaskEdit';
import { useBulkTaskEdit } from 'src/features/task/hooks/useBulkTaskEdit';
import { QuantitySelector } from 'src/legacy/components/QuantitySelector';
import { formatDuration, parseDuration } from 'src/legacy/utils/timeUtils';
import { DateInput } from 'src/shared/components/DateInput';

export interface TaskSelectionToolbarProps {
  totalCount: number;
  selectedCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onApply: (actions: BulkTaskActions) => void;
  onCancel: () => void;
}

/**
 * Renders the sticky footer + "Bulk Edit" modal
 * Uses `useBulkTaskEdit` to keep component purely presentational
 */
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

  const {
    modalOpen,
    controls,
    tagAction,
    setTagAction,
    tagId,
    setTagId,
    dateValue,
    setDateValue,
    timeValue,
    setTimeValue,
    anyAction,
    openModal,
    closeModal,
    applyChanges,
  } = useBulkTaskEdit(onApply);
  const allTags = useTagsStore(s => s.items);
  const tags = allTags.filter(t => !t.trashed);

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
            {controls.map(({ label, state, setter }) => (
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
                  <ToggleButton value="set" color="primary">
                    Mark
                  </ToggleButton>
                  <ToggleButton value="clear" color="error">
                    Clear
                  </ToggleButton>
                  <ToggleButton value="none">None</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            ))}

            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
              <span>Tag</span>
              <Stack direction="row" gap={1} alignItems="center">
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={tagAction}
                  onChange={(_, v) => setTagAction(v || 'none')}
                  aria-label="Tag action"
                >
                  <ToggleButton value="select" color="primary">
                    Set
                  </ToggleButton>
                  <ToggleButton value="clear" color="error">
                    Clear
                  </ToggleButton>
                  <ToggleButton value="none">None</ToggleButton>
                </ToggleButtonGroup>
                {tagAction === 'select' && (
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Tag</InputLabel>
                    <Select label="Tag" value={tagId} onChange={e => setTagId(e.target.value)}>
                      {tags.map(t => (
                        <MenuItem key={t.id} value={t.id}>
                          <TagLabel tag={t} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Stack>
            </Stack>

            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
              <span>Date</span>
              <DateInput label="Planned Date" value={dateValue} onChange={setDateValue} />
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
                  onValueChange={setTimeValue}
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
          <Button variant="contained" disabled={!anyAction} onClick={applyChanges}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
