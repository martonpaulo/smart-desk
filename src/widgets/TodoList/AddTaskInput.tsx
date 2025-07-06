import TextField from '@mui/material/TextField';

interface AddTaskInputProps {
  columnId: string;
  onAdd: (columnId: string, title: string) => string;
  onStartEdit?: (id: string) => void;
}

export function AddTaskInput({ columnId, onAdd, onStartEdit }: AddTaskInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) return;
    const id = onAdd(columnId, value);
    onStartEdit?.(id);
    e.target.value = '';
  };

  return (
    <TextField
      fullWidth
      size="small"
      placeholder="+ new task"
      onChange={handleChange}
      slotProps={{
        input: {
          sx: theme => ({
            fontSize: theme.typography.body2.fontSize,
            lineHeight: theme.typography.body2.lineHeight,
            fontWeight: theme.typography.body2.fontWeight,
          }),
        },
      }}
    />
  );
}
