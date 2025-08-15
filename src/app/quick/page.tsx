'use client';

import { useMemo, useState } from 'react';

import TuneIcon from '@mui/icons-material/Tune';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';

import { PageSection } from '@/core/components/PageSection';
import { defaultColumns } from '@/features/column/config/defaultColumns';
import { AddTaskInput } from '@/legacy/components/task/AddTaskInput';
import { TaskCard } from '@/legacy/components/task/TaskCard';
import { useTasks } from '@/legacy/hooks/useTasks';
import { Column } from '@/legacy/types/column';
import { Task } from '@/legacy/types/task';
import { useResponsiveness } from '@/shared/hooks/useResponsiveness';

export default function QuickList() {
  const theme = useTheme();
  const isMobile = useResponsiveness();

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [selectedColumnIds, setSelectedColumnIds] = useState<string[]>([]);
  const [mobilePickerOpen, setMobilePickerOpen] = useState(false);

  const cardWidth = isMobile ? '100%' : '250px';

  // Today’s not-done tasks
  const tasks = useTasks({
    plannedDate: new Date(),
    trashed: false,
    done: false,
    classified: true,
  }) as Task[];

  // Columns from config, sorted
  const allColumns: Column[] = useMemo(() => {
    const arr = Object.values(defaultColumns) as Column[];
    return [...arr].sort((a, b) => a.position - b.position || a.title.localeCompare(b.title));
  }, []);

  const isAll = selectedColumnIds.length === 0;
  const selectedColumns = isAll
    ? allColumns
    : allColumns.filter(c => selectedColumnIds.includes(c.id));

  const filteredTasks = useMemo(() => {
    if (isAll) return tasks;
    const allowed = new Set(selectedColumnIds);
    return tasks.filter(t => allowed.has(t.columnId));
  }, [isAll, tasks, selectedColumnIds]);

  const getColumnById = (id: string) => allColumns.find(c => c.id === id);

  // Reusable picker content
  const ColumnPicker = (
    <Autocomplete
      multiple
      size="small"
      options={allColumns}
      value={allColumns.filter(c => selectedColumnIds.includes(c.id))}
      onChange={(_, value) => setSelectedColumnIds(value.map(v => v.id))}
      getOptionLabel={opt => opt.title}
      renderValue={(selected, getTagProps) =>
        selected.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={option.id}
            label={option.title}
            size="small"
            sx={{
              '& .MuiChip-label': { px: 0.75 },
              borderLeft: `3px solid ${option.color}`,
            }}
          />
        ))
      }
      renderInput={params => (
        <TextField {...params} label="Columns" placeholder={isAll ? 'All' : 'Filter…'} />
      )}
      slotProps={{ popper: { sx: { maxWidth: 360 } } }}
      sx={{ width: isMobile ? '100%' : 320 }}
    />
  );

  return (
    <PageSection title="Quick List" hideDescription>
      <AddTaskInput
        variant="outlined"
        taskProperties={{ plannedDate: new Date(), classifiedDate: new Date() }}
        sx={{ width: cardWidth }}
        onFinishAddingAction={newId => setEditingTaskId(newId)}
      />

      {/* Toolbar */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
        sx={{ mt: 1.5, mb: 1 }}
      >
        <Typography variant="subtitle2" color="text.secondary">
          {isAll ? 'Showing all columns' : `Showing ${selectedColumns.length} column(s)`}
        </Typography>

        {/* Desktop: inline picker + actions. Mobile: compact filter button */}
        {isMobile ? (
          <Stack direction="row" spacing={1} alignItems="center">
            {/* quick preview of selected */}
            <Stack direction="row" spacing={0.5} sx={{ maxWidth: 180, overflowX: 'auto' }}>
              {(isAll ? allColumns.slice(0, 2) : selectedColumns.slice(0, 3)).map(col => (
                <Chip
                  key={col.id}
                  label={col.title}
                  size="small"
                  sx={{ borderLeft: `3px solid ${col.color}` }}
                />
              ))}
              {!isAll && selectedColumns.length > 3 && (
                <Chip size="small" label={`+${selectedColumns.length - 3}`} key="more" />
              )}
            </Stack>
            <IconButton
              aria-label="Filter columns"
              color="primary"
              onClick={() => setMobilePickerOpen(true)}
              size="small"
            >
              <TuneIcon />
            </IconButton>
          </Stack>
        ) : (
          <Stack direction="row" spacing={1} alignItems="center">
            {ColumnPicker}
            <Button
              size="small"
              variant="text"
              onClick={() => setSelectedColumnIds([])}
              aria-label="Show all columns"
            >
              All
            </Button>
            <Button
              size="small"
              variant="text"
              onClick={() => setSelectedColumnIds(allColumns.map(c => c.id))}
              aria-label="Select all columns"
            >
              Select
            </Button>
            <Button
              size="small"
              variant="text"
              onClick={() => setSelectedColumnIds([])}
              aria-label="Clear selection"
            >
              Clear
            </Button>
          </Stack>
        )}
      </Stack>

      <Divider sx={{ mb: 1.5 }} />

      {/* Empty state or list */}
      {filteredTasks.length === 0 ? (
        <Box
          sx={{
            py: 4,
            px: 2,
            borderRadius: 1,
            bgcolor: theme.palette.action.hover,
            color: 'text.secondary',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2">
            {isAll ? 'No tasks for today' : 'No tasks in the selected columns'}
          </Typography>
        </Box>
      ) : (
        <Stack direction="row" flexWrap="wrap" gap={2} mb={2}>
          {filteredTasks.map(task => {
            const col = getColumnById(task.columnId);
            return (
              <TaskCard
                key={task.id}
                task={task}
                showDaily={false}
                showDate={false}
                showDuration
                showTag={false}
                color={col?.color ?? theme.palette.primary.main}
                editTask={editingTaskId === task.id}
                onFinishEditing={() => setEditingTaskId(null)}
              />
            );
          })}
        </Stack>
      )}

      {/* Mobile full-screen picker */}
      <Dialog fullScreen open={mobilePickerOpen} onClose={() => setMobilePickerOpen(false)}>
        <DialogTitle>Choose columns</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {ColumnPicker}
            <Stack direction="row" spacing={1}>
              <Button onClick={() => setSelectedColumnIds([])}>All</Button>
              <Button onClick={() => setSelectedColumnIds(allColumns.map(c => c.id))}>
                Select
              </Button>
              <Button onClick={() => setSelectedColumnIds([])}>Clear</Button>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMobilePickerOpen(false)} variant="contained">
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </PageSection>
  );
}
