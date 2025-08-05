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

import { TagLabel } from '@/features/tag/components/TagLabel';
import { useTagsStore } from '@/features/tag/store/useTagsStore';
import { clearedFilters } from '@/features/task/constants/clearedFilters';
import { TaskFilters } from '@/features/task/types/TaskFilters';
import { useResponsiveness } from '@/shared/hooks/useResponsiveness';

interface TaskFilterPanelProps {
  filters: TaskFilters;
  onFilterChange: (newFilters: TaskFilters) => void;
}

export function TaskFilterPanel({ filters, onFilterChange }: TaskFilterPanelProps) {
  const isMobile = useResponsiveness();
  const allTags = useTagsStore(s => s.items);
  const tags = allTags.filter(t => !t.trashed);

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

  const handleTagChange = (e: SelectChangeEvent<string>) => {
    const id = e.target.value;
    setLocalFilters({
      ...localFilters,
      tagId: id || undefined,
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
      <FormControl size="small" sx={{ width: isMobile ? '100%' : 150 }}>
        <InputLabel>{label}</InputLabel>
        <Select value={value} label={label} onChange={handleTriStateChange(key)}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="true">Yes</MenuItem>
          <MenuItem value="false">No</MenuItem>
        </Select>
      </FormControl>
    );
  };

  if (!showFilters) {
    return (
      <Stack direction="row">
        <Button variant="contained" onClick={() => setShowFilters(true)}>
          Show Filters
        </Button>
      </Stack>
    );
  }

  return (
    <Stack>
      <Stack
        flexWrap="wrap"
        padding={2}
        marginBottom={2}
        gap={1}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <Stack direction="row" gap={1} flexWrap="wrap">
          <TextField
            label="Title"
            size="small"
            sx={{ width: isMobile ? '100%' : 300 }}
            value={localFilters.title ?? ''}
            onChange={handleTitleChange}
          />

          <TextField
            label="Planned Date"
            type="date"
            size="small"
            sx={{ width: isMobile ? '100%' : 200 }}
            slotProps={{ inputLabel: { shrink: true } }}
            value={
              localFilters.plannedDate ? localFilters.plannedDate.toISOString().slice(0, 10) : ''
            }
            onChange={handleDateChange}
          />
        </Stack>

        <Stack direction="row" gap={1} flexWrap="wrap">
          {renderTriStateSelect('Important', 'important')}
          {renderTriStateSelect('Urgent', 'urgent')}
          {renderTriStateSelect('Blocked', 'blocked')}
          {renderTriStateSelect('Done', 'done')}
          {renderTriStateSelect('Daily', 'daily')}
          {renderTriStateSelect('Trashed', 'trashed')}
          <FormControl size="small" sx={{ width: isMobile ? '100%' : 150 }}>
            <InputLabel>Tag</InputLabel>
            <Select value={localFilters.tagId ?? ''} label="Tag" onChange={handleTagChange}>
              <MenuItem value="">All</MenuItem>
              {tags.map(t => (
                <MenuItem key={t.id} value={t.id}>
                  <TagLabel tag={t} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      <Stack direction="row" justifyContent="space-between">
        <Button variant="outlined" onClick={() => setShowFilters(false)}>
          Hide Filters
        </Button>
        <Stack direction="row" gap={1}>
          <Button variant="outlined" onClick={clearLocal}>
            Clear
          </Button>
          <Button variant="contained" onClick={() => onFilterChange(localFilters)}>
            Apply Filters
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}
