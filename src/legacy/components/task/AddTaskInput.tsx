import { useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import { alpha, darken, MenuItem, Select, Stack } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import TextField, { TextFieldProps } from '@mui/material/TextField';

import { defaultColumns } from '@/features/column/config/defaultColumns';
import { TagLabel } from '@/features/tag/components/TagLabel';
import { useTagsStore } from '@/features/tag/store/TagsStore';
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
  ...props
}: AddTaskInputProps) {
  const addTask = useBoardStore(state => state.addTask);
  const tags = useTagsStore(state => state.items.filter(t => !t.trashed));
  const [tagId, setTagId] = useState('');

  const columnColor = columnProperties?.color || defaultColumns.draft.color;
  const color = alpha(darken(columnColor, 0.2), 0.15);

  const handleAddTask = async () => {
    const id = await addTask({
      title: '',
      columnId: columnProperties?.id,
      tagId: tagId || undefined,
      updatedAt: new Date(),
      ...taskProperties,
    });
    onFinishAdding(id);
  };

  return (
    <Stack direction="row" gap={1} alignItems="center">
      <Select
        size="small"
        value={tagId}
        onChange={e => setTagId(e.target.value)}
        sx={{ minWidth: 90 }}
      >
        <MenuItem value="">No tag</MenuItem>
        {tags.map(t => (
          <MenuItem key={t.id} value={t.id}>
            <TagLabel tag={t} />
          </MenuItem>
        ))}
      </Select>

      <TextField
        {...props}
        size="small"
        variant={variant}
        placeholder="New task"
        onFocus={handleAddTask}
        sx={{
          ...props.sx,
          borderColor: color,
          '& input': {
            cursor: 'pointer',
          },
          '& .MuiInputBase-root': {
            cursor: 'pointer',
            transition: 'background-color 0.15s',
            '&:hover': { backgroundColor: color },
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: color,
            },
            '&:hover fieldset': {
              borderColor: color,
            },
            '&.Mui-focused fieldset': {
              borderColor: color,
            },
          },
        }}
        slotProps={{
          htmlInput: { readOnly: true },
          input: {
            sx: theme => ({
              fontSize: theme.typography.body2.fontSize,
              lineHeight: theme.typography.body2.lineHeight,
              fontWeight: theme.typography.body2.fontWeight,
            }),
            startAdornment: (
              <InputAdornment position="start">
                <AddIcon color="action" fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
    </Stack>
  );
}
