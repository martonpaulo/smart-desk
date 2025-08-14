'use client';

import { useEffect, useMemo, useState } from 'react';

import FilterAltIcon from '@mui/icons-material/FilterAlt';
import {
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';

import { TagLabel } from '@/features/tag/components/TagLabel';
import { useTagsStore } from '@/features/tag/store/useTagsStore';
import { clearedFilters } from '@/features/task/constants/clearedFilters';
import type { TaskFilters } from '@/features/task/types/TaskFilters';
import { DateInput } from '@/shared/components/DateInput';
import { useResponsiveness } from '@/shared/hooks/useResponsiveness';

type TaskFilterPanelProps = {
  filters: TaskFilters;
  onFilterChangeAction: (newFilters: TaskFilters) => void;
};

type TriKey = keyof Omit<TaskFilters, 'title' | 'plannedDate' | 'tagId'>;

export function TaskFilterPanel({ filters, onFilterChangeAction }: TaskFilterPanelProps) {
  const isMobile = useResponsiveness();

  // Tags
  const allTags = useTagsStore(s => s.items);
  const tags = useMemo(() => allTags.filter(t => !t.trashed), [allTags]);

  // Show/hide panel
  const [open, setOpen] = useState(true);

  // Local copy of filters
  const [local, setLocal] = useState<TaskFilters>(filters);
  useEffect(() => setLocal(filters), [filters]);

  // Handlers
  const onTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setLocal(prev => ({ ...prev, title: text.trim() === '' ? null : text }));
  };
  const onDate = (date: Date | null) => {
    setLocal(prev => ({ ...prev, plannedDate: date }));
  };
  const onTag = (e: SelectChangeEvent<string>) => {
    const id = e.target.value;
    setLocal(prev => ({ ...prev, tagId: id || undefined }));
  };
  const onTri = (key: TriKey) => (e: SelectChangeEvent<string>) => {
    const raw = e.target.value;
    const newValue = raw === '' ? null : raw === 'true';
    setLocal(prev => ({ ...prev, [key]: newValue }));
  };

  const clearLocal = () => {
    setLocal(clearedFilters);
    onFilterChangeAction(clearedFilters);
  };

  // Applied filters summary chips
  const chips = useMemo(() => {
    const list: string[] = [];
    if (local.title) list.push(`Title: "${local.title}"`);
    if (local.plannedDate) list.push(`Date: ${local.plannedDate.toLocaleDateString()}`);
    (['important', 'urgent', 'blocked', 'done', 'daily', 'trashed'] as TriKey[]).forEach(k => {
      const v = local[k];
      if (v != null) list.push(`${capitalize(k)}: ${v ? 'Yes' : 'No'}`);
    });
    if (local.tagId) {
      const tg = tags.find(t => t.id === local.tagId);
      if (tg) list.push(`Tag: ${tg.name}`);
    }
    return list;
  }, [local, tags]);

  return (
    <Stack sx={{ mb: 1.5 }}>
      {/* Toolbar header */}
      <Toolbar disableGutters sx={{ minHeight: 40, justifyContent: 'space-between' }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <IconButton
            size="small"
            color={open ? 'primary' : 'default'}
            onClick={() => setOpen(v => !v)}
            aria-label="Toggle filters"
          >
            <FilterAltIcon fontSize="small" />
          </IconButton>
          <Typography variant="subtitle2" color="text.secondary">
            Filters
          </Typography>
        </Stack>

        {/* Quick actions */}
        <Stack direction="row" gap={1}>
          <Button size="medium" onClick={clearLocal}>
            Clear
          </Button>
          <Button size="medium" variant="contained" onClick={() => onFilterChangeAction(local)}>
            Apply
          </Button>
        </Stack>
      </Toolbar>

      {/* Chips summary for mobile even when closed */}
      {!open && chips.length > 0 && (
        <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mb: 1 }}>
          {chips.map((c, i) => (
            <Chip key={i} label={c} size="small" />
          ))}
        </Stack>
      )}

      {/* Panel content */}
      {open && (
        <Stack
          flexWrap="wrap"
          gap={1}
          sx={{
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            mb: 1,
          }}
        >
          {/* Row 1: Title + Date */}
          <Stack direction="row" gap={1} flexWrap="wrap">
            <TextField
              label="Title"
              size="small"
              sx={{ width: isMobile ? '100%' : 320 }}
              value={local.title ?? ''}
              onChange={onTitle}
              onKeyDown={e => {
                if (e.key === 'Enter') onFilterChangeAction(local);
              }}
            />
            <DateInput label="Planned date" value={local.plannedDate} onChange={onDate} />
          </Stack>

          {/* Row 2: Tri-state flags + Tag */}
          <Stack direction="row" gap={1} flexWrap="wrap">
            <TriStateSelect
              label="Important"
              value={local.important}
              onChange={onTri('important')}
              isMobile={isMobile}
            />
            <TriStateSelect
              label="Urgent"
              value={local.urgent}
              onChange={onTri('urgent')}
              isMobile={isMobile}
            />
            <TriStateSelect
              label="Blocked"
              value={local.blocked}
              onChange={onTri('blocked')}
              isMobile={isMobile}
            />
            <TriStateSelect
              label="Done"
              value={local.done}
              onChange={onTri('done')}
              isMobile={isMobile}
            />
            <TriStateSelect
              label="Daily"
              value={local.daily}
              onChange={onTri('daily')}
              isMobile={isMobile}
            />
            <TriStateSelect
              label="Trashed"
              value={local.trashed}
              onChange={onTri('trashed')}
              isMobile={isMobile}
            />

            <FormControl size="small" sx={{ width: isMobile ? '100%' : 160 }}>
              <InputLabel>Tag</InputLabel>
              <Select value={local.tagId ?? ''} label="Tag" onChange={onTag}>
                <MenuItem value="">All</MenuItem>
                {tags.map(t => (
                  <MenuItem key={t.id} value={t.id}>
                    <TagLabel tag={t} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {/* Summary chips when open */}
          {chips.length > 0 && (
            <Stack direction="row" flexWrap="wrap" gap={0.5}>
              {chips.map((c, i) => (
                <Chip key={i} label={c} size="small" />
              ))}
            </Stack>
          )}
        </Stack>
      )}
    </Stack>
  );
}

/** Small, typed tri-state select used across the panel */
function TriStateSelect({
  label,
  value,
  onChange,
  isMobile,
}: {
  label: string;
  value: boolean | null | undefined;
  onChange: (e: SelectChangeEvent<string>) => void;
  isMobile: boolean;
}) {
  const current = value;
  const val = current == null ? '' : current ? 'true' : 'false';

  return (
    <FormControl size="small" sx={{ width: isMobile ? '100%' : 150 }}>
      <InputLabel>{label}</InputLabel>
      <Select value={val} label={label} onChange={onChange}>
        <MenuItem value="">All</MenuItem>
        <MenuItem value="true">Yes</MenuItem>
        <MenuItem value="false">No</MenuItem>
      </Select>
    </FormControl>
  );
}

function capitalize(s: string) {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}
