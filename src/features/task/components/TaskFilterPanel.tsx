import { useEffect, useState } from 'react';

import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
} from '@mui/material';

import { clearedFilters } from '@/features/task/constants/clearedFilters';
import { TaskFilters } from '@/features/task/types/TaskFilters';
import { useResponsiveness } from '@/shared/hooks/useResponsiveness';

interface TaskFilterPanelProps {
  filters: TaskFilters;
  onFilterChange: (newFilters: TaskFilters) => void;
}

export function TaskFilterPanel({ filters, onFilterChange }: TaskFilterPanelProps) {
  const { isMobile } = useResponsiveness();

  // state to show or hide the filter controls
  const [showFilters, setShowFilters] = useState(true);
  // local copy of filters
  const [localFilters, setLocalFilters] = useState<TaskFilters>(filters);

  // keep local in sync if parent filters change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const parseDateAtNoon = (isoDate: string): Date => {
    const [year, month, day] = isoDate.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value.trim();
    setLocalFilters({
      ...localFilters,
      title: text === '' ? null : text,
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalFilters({
      ...localFilters,
      plannedDate: value ? parseDateAtNoon(value) : null,
    });
  };

  const handleTriStateChange =
    (key: keyof Omit<TaskFilters, 'title' | 'plannedDate'>) => (e: SelectChangeEvent<string>) => {
      const raw = e.target.value;
      const newValue = raw === '' ? null : raw === 'true';
      setLocalFilters({
        ...localFilters,
        [key]: newValue,
      });
    };

  const clearLocal = () => {
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const renderTriStateSelect = (
    label: string,
    key: keyof Omit<TaskFilters, 'title' | 'plannedDate'>,
  ) => {
    const current = localFilters[key];
    const value = current == null ? '' : current ? 'true' : 'false';

    return (
      <FormControl size="small" fullWidth sx={{ maxWidth: isMobile ? '100%' : 150 }}>
        <InputLabel>{label}</InputLabel>
        <Select value={value} label={label} onChange={handleTriStateChange(key)}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="true">Yes</MenuItem>
          <MenuItem value="false">No</MenuItem>
        </Select>
      </FormControl>
    );
  };

  return (
    <Stack direction="column" spacing={1}>
      <Button variant="outlined" size="small" onClick={() => setShowFilters(prev => !prev)}>
        {showFilters ? 'Hide Filters' : 'Show Filters'}
      </Button>

      {showFilters && (
        <Stack
          direction="row"
          flexWrap="wrap"
          padding={2}
          gap={1.5}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          }}
        >
          <TextField
            label="Title"
            size="small"
            fullWidth
            sx={{ maxWidth: 300 }}
            value={localFilters.title ?? ''}
            onChange={handleTitleChange}
          />

          <TextField
            label="Planned Date"
            type="date"
            size="small"
            fullWidth
            sx={{ maxWidth: 200 }}
            slotProps={{ inputLabel: { shrink: true } }}
            value={
              localFilters.plannedDate ? localFilters.plannedDate.toISOString().slice(0, 10) : ''
            }
            onChange={handleDateChange}
          />

          {renderTriStateSelect('Important', 'important')}
          {renderTriStateSelect('Urgent', 'urgent')}
          {renderTriStateSelect('Blocked', 'blocked')}
          {renderTriStateSelect('Done', 'done')}
          {renderTriStateSelect('Daily', 'daily')}
          {renderTriStateSelect('Trashed', 'trashed')}

          <Stack direction="row" gap={1} sx={{ marginLeft: 'auto' }}>
            <Button variant="outlined" size="medium" onClick={clearLocal}>
              Clear
            </Button>
            <Button variant="contained" size="medium" onClick={() => onFilterChange(localFilters)}>
              Apply Filters
            </Button>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
