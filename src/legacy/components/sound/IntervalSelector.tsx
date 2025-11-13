import EditIcon from '@mui/icons-material/Edit';
import { Box, IconButton, MenuItem, TextField } from '@mui/material';
import { ChangeEvent } from 'react';

interface IntervalSelectorProps {
  interval: number;
  isEditing: boolean;
  onEditStart: () => void;
  onIntervalChange: (newInterval: number) => void;
  disabled: boolean;
  canEdit: boolean;
}

const INTERVAL_OPTIONS = [15, 30, 60] as const;

export function IntervalSelector({
  interval,
  isEditing,
  onEditStart,
  onIntervalChange,
  disabled,
  canEdit,
}: IntervalSelectorProps) {
  const handleIntervalChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newInterval = Number(event.target.value);
    onIntervalChange(newInterval);
  };

  if (!isEditing) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        every {interval} minutes
        {canEdit && (
          <IconButton size="small" onClick={onEditStart} disabled={disabled}>
            <EditIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    );
  }

  return (
    <Box display="flex" alignItems="center" gap={1}>
      every
      <TextField
        select
        size="small"
        value={interval}
        onChange={handleIntervalChange}
        onBlur={() => onIntervalChange(interval)}
        disabled={disabled}
      >
        {INTERVAL_OPTIONS.map(value => (
          <MenuItem key={value} value={value}>
            {value}
          </MenuItem>
        ))}
      </TextField>
      minutes
    </Box>
  );
}
