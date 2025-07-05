import { useState } from 'react';

import CheckIcon from '@mui/icons-material/Check';
import { Box, IconButton, TextField } from '@mui/material';

interface AddItemInputProps {
  columnId: string;
  onAdd: (columnId: string, title: string) => void;
}

export function AddItemInput({ columnId, onAdd }: AddItemInputProps) {
  const [value, setValue] = useState('');

  const addItem = () => {
    const title = value.trim();
    if (!title) return;
    onAdd(columnId, title);
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <Box mt={1} sx={{ display: 'flex', gap: 1 }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Add new item"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <IconButton color="primary" onClick={addItem}>
        <CheckIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
