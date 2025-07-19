import AddIcon from '@mui/icons-material/Add';
import InputAdornment from '@mui/material/InputAdornment';
import TextField, { TextFieldProps } from '@mui/material/TextField';

import { defaultColumns } from '@/config/defaultColumns';
import { useBoardStore } from '@/store/board/store';

interface AddTaskInputProps extends TextFieldProps<'outlined'> {
  columnId?: string;
  columnColor?: string;
  onFinishAdding: (taskId: string) => void;
}

export function AddTaskInput({
  columnId,
  columnColor = defaultColumns.draft.color,
  onFinishAdding,
  variant = 'outlined',
  ...props
}: AddTaskInputProps) {
  const addTask = useBoardStore(state => state.addTask);

  const handleAddTask = async () => {
    const id = await addTask({
      title: '',
      columnId,
      updatedAt: new Date(),
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
        borderColor: columnColor,
        '& input': {
          cursor: 'pointer',
        },
        '& .MuiInputBase-root': {
          cursor: 'pointer',
          transition: 'background-color 0.15s',
          '&:hover': { backgroundColor: columnColor },
        },
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: columnColor,
          },
          '&:hover fieldset': {
            borderColor: columnColor,
          },
          '&.Mui-focused fieldset': {
            borderColor: columnColor,
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
