import { useState } from 'react';

import { Box, TextField } from '@mui/material';

interface AddItemInputProps {
  columnId: string;
  onAdd: (columnId: string, title: string) => void;
}

export function AddItemInput({ columnId, onAdd }: AddItemInputProps) {
  const [value, setValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const title = value.trim();
      if (!title) return;
      onAdd(columnId, title);
      setValue('');
    }
  };

  return (
    <Box mt={1}>
      <TextField
        fullWidth
        size="small"
        placeholder="Add new item"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </Box>
  );
}
