import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PaletteIcon from '@mui/icons-material/Palette';
import { alpha, Box, IconButton, Stack, Typography } from '@mui/material';

import { AddItemInput } from '@/widgets/TodoList/AddItemInput';
import { TodoItemCard } from '@/widgets/TodoList/TodoItemCard';
import { Column, TodoItem } from '@/widgets/TodoList/types';

interface TodoColumnProps {
  column: Column;
  items: TodoItem[];
  view: 'list' | 'board';
  onRenameColumn: (id: string) => void;
  onDeleteColumn: (id: string) => void;
  onChangeColor: (id: string) => void;
  onEditItem: (id: string) => void;
  onRenameItem: (id: string, title: string) => void;
  onDeleteItem: (id: string) => void;
  onCompleteItem: (id: string) => void;
  onAddItem: (columnId: string, title: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragOverItem: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, columnId: string) => void;
  onColumnDragStart?: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onColumnDragOver?: (e: React.DragEvent<HTMLDivElement>, overId: string) => void;
  onColumnDragEnd?: () => void;
  hideHeader?: boolean;
}

export function TodoColumn({
  column,
  items,
  view,
  onRenameColumn,
  onDeleteColumn,
  onChangeColor,
  onEditItem,
  onRenameItem,
  onDeleteItem,
  onCompleteItem,
  onAddItem,
  onDragStart,
  onDragOverItem,
  onDrop,
  onColumnDragStart,
  onColumnDragOver,
  onColumnDragEnd,
  hideHeader,
}: TodoColumnProps) {
  return (
    <Box
      draggable
      onDragStart={e => onColumnDragStart && onColumnDragStart(e, column.id)}
      onDragOver={e => {
        e.preventDefault();
        if (onColumnDragOver) onColumnDragOver(e, column.id);
      }}
      onDragEnd={onColumnDragEnd}
      onDrop={e => onDrop(e, column.id)}
      sx={{
        width: view === 'board' ? '250px' : '100%',
        p: 1.5,
        bgcolor: alpha(column.color, 0.1),
        borderRadius: 1,
      }}
    >
      {!hideHeader && (
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="h6" sx={{ color: column.color }}>
            {column.title}
          </Typography>
          <Stack direction="row" spacing={0}>
            <IconButton size="small" onClick={() => onRenameColumn(column.id)}>
              <EditIcon fontSize="inherit" />
            </IconButton>
            <IconButton size="small" onClick={() => onChangeColor(column.id)}>
              <PaletteIcon fontSize="inherit" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDeleteColumn(column.id)}
              disabled={column.id === 'done'}
              color="error"
            >
              <DeleteIcon fontSize="inherit" />
            </IconButton>
          </Stack>
        </Stack>
      )}
      {items.map(item => (
        <TodoItemCard
          key={item.id}
          item={item}
          column={column}
          onOpen={onEditItem}
          onRename={onRenameItem}
          onDelete={onDeleteItem}
          onComplete={onCompleteItem}
          onDragStart={onDragStart}
          onDragOver={onDragOverItem}
        />
      ))}
      <AddItemInput columnId={column.id} onAdd={onAddItem} />
    </Box>
  );
}
