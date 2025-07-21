import AddIcon from '@mui/icons-material/Add';
import { alpha, darken } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import TextField, { TextFieldProps } from '@mui/material/TextField';

import { defaultColumns } from '@/config/defaultColumns';
import { useBoardStore } from '@/store/board/store';
import { Column } from '@/types/column';
import { Task } from '@/types/task';

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

  const columnColor = columnProperties?.color || defaultColumns.draft.color;
  const color = alpha(darken(columnColor, 0.2), 0.15);

  const handleAddTask = async () => {
    const id = await addTask({
      title: '',
      columnId: columnProperties?.id,
      updatedAt: new Date(),
      ...taskProperties,
    });
    onFinishAdding(id);
  };

  return (
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
  );
}
