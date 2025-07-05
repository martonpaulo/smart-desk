import { alpha, Box, IconButton, Stack, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import type { Column, TodoItem } from '../types';
import { TodoItemCard } from './TodoItemCard';

interface TodoColumnProps {
  column: Column;
  items: TodoItem[];
  onRenameColumn: (id: string) => void;
  onDeleteColumn: (id: string) => void;
  onEditItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onCompleteItem: (id: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragOverItem: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, columnId: string) => void;
}

export function TodoColumn({
  column,
  items,
  onRenameColumn,
  onDeleteColumn,
  onEditItem,
  onDeleteItem,
  onCompleteItem,
  onDragStart,
  onDragOverItem,
  onDrop,
}: TodoColumnProps) {
  return (
    <Box
      onDragOver={e => e.preventDefault()}
      onDrop={e => onDrop(e, column.id)}
      sx={{ width: 250, p: 1, bgcolor: alpha(column.color, 0.1), borderRadius: 1 }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="h6" sx={{ color: column.color }}>
          {column.title}
        </Typography>
        <Stack direction="row" spacing={0}>
          <IconButton size="small" onClick={() => onRenameColumn(column.id)}>
            <EditIcon fontSize="inherit" />
          </IconButton>
          <IconButton size="small" onClick={() => onDeleteColumn(column.id)}>
            <DeleteIcon fontSize="inherit" />
          </IconButton>
        </Stack>
      </Stack>
      {items.map(item => (
        <TodoItemCard
          key={item.id}
          item={item}
          column={column}
          onEdit={onEditItem}
          onDelete={onDeleteItem}
          onComplete={onCompleteItem}
          onDragStart={onDragStart}
          onDragOver={onDragOverItem}
        />
      ))}
    </Box>
  );
}
