import { useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import { IconButton, InputAdornment, TextField } from '@mui/material';

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
    <TextField
      fullWidth
      size="small"
      placeholder="new item"
      value={value}
      onChange={e => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={addItem}>
                <AddIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
          sx: {
            paddingRight: '0px',
          },
        },
      }}
    />
  );
}
