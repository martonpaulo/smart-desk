import { useState } from 'react';

import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import { Box, Chip, Dialog, DialogContent, IconButton, Stack, Tooltip, Typography } from '@mui/material';

import type { Column, TodoItem } from '../types';

interface TodoItemCardProps {
  item: TodoItem;
  column: Column;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
}

export function TodoItemCard({ item, column, onEdit, onDelete, onComplete, onDragStart, onDragOver }: TodoItemCardProps) {
  const [showDescription, setShowDescription] = useState(false);

  return (
    <Box
      data-todo-id={item.id}
      draggable
      onDragStart={e => onDragStart(e, item.id)}
      onDragOver={e => onDragOver(e, item.id)}
      sx={{ p: 1, border: '1px solid', borderColor: column.color, borderRadius: 1, mb: 1, position: 'relative' }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body1">{item.title}</Typography>
          {item.description && (
            <Tooltip title="Show description">
              <IconButton size="small" onClick={() => setShowDescription(true)}>
                <InfoIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
        <Stack direction="row" spacing={1} sx={{ visibility: 'hidden' }} className="todo-actions">
          <IconButton size="small" onClick={() => onEdit(item.id)}>
            <EditIcon fontSize="inherit" />
          </IconButton>
          <IconButton size="small" onClick={() => onComplete(item.id)}>
            <CheckIcon fontSize="inherit" />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete(item.id)}>
            <DeleteIcon fontSize="inherit" />
          </IconButton>
        </Stack>
      </Stack>
      <Stack direction="row" spacing={1} mt={0.5} flexWrap="wrap">
        {item.tags.map(tag => (
          <Chip key={tag} label={tag} size="small" />
        ))}
      </Stack>
      <Dialog open={showDescription} onClose={() => setShowDescription(false)}>
        <DialogContent>
          <Typography>{item.description}</Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
