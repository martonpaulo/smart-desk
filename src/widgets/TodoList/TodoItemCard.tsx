import { useState } from 'react';

import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, darken } from '@mui/material/styles';

import { Column, TodoItem } from '@/widgets/TodoList/types';

interface TodoItemCardProps {
  item: TodoItem;
  column: Column;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
}

export function TodoItemCard({
  item,
  column,
  onEdit,
  onDelete,
  onComplete,
  onDragStart,
  onDragOver,
}: TodoItemCardProps) {
  const [showDescription, setShowDescription] = useState(false);

  return (
    <Box
      data-todo-id={item.id}
      draggable
      onDragStart={e => onDragStart(e, item.id)}
      onDragOver={e => onDragOver(e, item.id)}
      sx={{
        p: 1,
        borderRadius: 1,
        mb: 1,
        position: 'relative',
        bgcolor: alpha(darken(column.color, 0.2), 0.15),
        cursor: 'move',
        '&:hover .todo-actions': {
          visibility: 'visible',
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" alignItems="center">
          {item.description && (
            <Tooltip title="Show description">
              <IconButton size="small" onClick={() => setShowDescription(true)}>
                <DescriptionIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          )}

          <Typography>{item.title}</Typography>
        </Stack>
        <Stack
          direction="row"
          sx={{ visibility: 'hidden', '& button': { cursor: 'pointer' } }}
          className="todo-actions"
        >
          <IconButton size="small" onClick={() => onEdit(item.id)}>
            <EditIcon fontSize="inherit" />
          </IconButton>
          <IconButton size="small" onClick={() => onComplete(item.id)}>
            <CheckIcon fontSize="inherit" />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete(item.id)} color="error">
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
