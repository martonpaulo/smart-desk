import AddIcon from '@mui/icons-material/Add';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

interface AddTaskInputProps {
  columnId: string;
  columnColor: string;
  onAdd: (columnId: string, title: string) => string;
  onStartEdit?: (id: string) => void;
}

export function AddTaskInput({ columnId, columnColor, onAdd, onStartEdit }: AddTaskInputProps) {
  const handleFocus = () => {
    const id = onAdd(columnId, '');
    onStartEdit?.(id);
  };

  return (
    <TextField
      fullWidth
      size="small"
      placeholder="new task"
      onFocus={handleFocus}
      inputProps={{ readOnly: true }}
      sx={{
        '& .MuiInputBase-root': {
          '&:hover': { backgroundColor: columnColor },
        },
      }}
      slotProps={{
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
