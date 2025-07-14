import AddIcon from '@mui/icons-material/Add';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

interface AddTaskInputProps {
  columnId: string;
  columnColor: string;
  onAdd: (columnId: string, title: string) => Promise<string>;
  onStartEdit?: (id: string) => void;
}

export function AddTaskInput({ columnId, columnColor, onAdd, onStartEdit }: AddTaskInputProps) {
  const handleFocus = async () => {
    const id = await onAdd(columnId, '');
    onStartEdit?.(id);
  };

  return (
    <TextField
      fullWidth
      size="small"
      placeholder="New task"
      onFocus={handleFocus}
      inputProps={{ readOnly: true }}
      sx={{
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
