'use client';

import { useRef, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import InputAdornment from '@mui/material/InputAdornment';
import { alpha, darken, lighten } from '@mui/material/styles';
import TextField, { TextFieldProps } from '@mui/material/TextField';

import { defaultColumns } from '@/features/column/config/defaultColumns';
import { useBoardStore } from '@/legacy/store/board/store';
import { Column } from '@/legacy/types/column';
import { Task } from '@/legacy/types/task';

interface AddTaskInputProps extends TextFieldProps<'outlined'> {
  taskProperties?: Partial<Task>;
  columnProperties?: Partial<Column>;
  onFinishAdding: (taskId: string) => void;
}

export function AddTaskInput({
  taskProperties,
  columnProperties,
  onFinishAdding,
  variant = 'outlined',
  placeholder = 'Add a task…',
  disabled,
  ...props
}: AddTaskInputProps) {
  const addTask = useBoardStore(state => state.addTask);

  const columnColor = columnProperties?.color || defaultColumns.draft.color;

  const [creating, setCreating] = useState(false);
  const didLaunchRef = useRef(false);

  async function launchCreate() {
    if (disabled || creating || didLaunchRef.current) return;
    didLaunchRef.current = true;
    setCreating(true);
    try {
      const id = await addTask({
        title: '',
        columnId: columnProperties?.id,
        updatedAt: new Date(),
        ...taskProperties,
      });
      onFinishAdding(id);
    } finally {
      setCreating(false);
      setTimeout(() => {
        didLaunchRef.current = false;
      }, 50);
    }
  }

  return (
    <TextField
      {...props}
      disabled={disabled}
      size="small"
      variant={variant}
      placeholder={placeholder}
      onFocus={launchCreate}
      onClick={launchCreate}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          launchCreate();
        }
      }}
      slotProps={{
        htmlInput: { readOnly: true, 'aria-label': 'Create task' },
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <AddIcon color="action" fontSize="small" />
            </InputAdornment>
          ),
          sx: theme => ({
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontSize: theme.typography.body2.fontSize,
            lineHeight: theme.typography.body2.lineHeight,
            fontWeight: theme.typography.body2.fontWeight,
            '& .MuiInputAdornment-root': { mr: 0.5 },
          }),
        },
      }}
      // Use array form to keep SxProps happy
      sx={{
        ...theme => {
          const base =
            theme.palette.mode === 'light' ? lighten(columnColor, 0.4) : darken(columnColor, 0.2);
          const surface = alpha(base, 0.18);

          return {
            cursor: disabled ? 'not-allowed' : 'pointer',
            '& .MuiInputBase-root': {
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: theme.transitions.create(['background-color', 'border-color']),
              '&:hover': !disabled ? { backgroundColor: surface } : undefined,
              ...(creating && { backgroundColor: surface }),
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: surface },
              '&:hover fieldset': { borderColor: surface },
              '&.Mui-focused fieldset': {
                borderColor: surface,
                boxShadow: `0 0 0 1px ${surface} inset`,
              },
            },
          };
        },
        ...(props.sx || {}), // merge any external sx without breaking types
      }}
    />
  );
}
