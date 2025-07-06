import { useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import { alpha, Box, Chip, darken, IconButton, Stack, Typography } from '@mui/material';

import { AddItemInput } from '@/widgets/TodoList/AddItemInput';
import { TodoItemCard } from '@/widgets/TodoList/TodoItemCard';
import { Column, TodoItem } from '@/widgets/TodoList/types';

interface TodoColumnProps {
  column: Column;
  items: TodoItem[];
  view: 'list' | 'board';
  onOpenColumn: (column: Column) => void;
  onAddColumn: (afterId: string) => void;
  onEditItem: (id: string) => void;
  onRenameItem: (id: string, title: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (columnId: string, title: string) => string;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragOverItem: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onItemColumnDragOver: (columnId: string) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, columnId: string) => void;
  onColumnDragStart?: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onColumnDragOver?: (e: React.DragEvent<HTMLDivElement>, overId: string) => void;
  onColumnDragEnd?: () => void;
  draggingItemId?: string | null;
  hoverItemId?: string | null;
  itemDropColumnId?: string | null;
  draggingColumnId?: string | null;
  hideHeader?: boolean;
}

export function TodoColumn({
  column,
  items,
  view,
  onOpenColumn,
  onAddColumn,
  onEditItem,
  onRenameItem,
  onDeleteItem,
  onAddItem,
  onDragStart,
  onDragOverItem,
  onItemColumnDragOver,
  onDrop,
  onColumnDragStart,
  onColumnDragOver,
  onColumnDragEnd,
  draggingItemId,
  hoverItemId,
  itemDropColumnId,
  draggingColumnId,
  hideHeader,
}: TodoColumnProps) {
  const [creatingId, setCreatingId] = useState<string | null>(null);

  const handleAddItem = (colId: string, title: string) => {
    const id = onAddItem(colId, title);
    setCreatingId(id);
    return id;
  };

  const finishCreate = () => setCreatingId(null);
  return (
    <Box
      className="todo-column"
      draggable
      onDragStart={e => onColumnDragStart && onColumnDragStart(e, column.id)}
      onDragOver={e => {
        e.preventDefault();
        if (draggingColumnId) {
          onColumnDragOver?.(e, column.id);
        }
        if (draggingItemId) {
          onItemColumnDragOver(column.id);
        }
      }}
      onDragEnd={onColumnDragEnd}
      onDrop={e => onDrop(e, column.id)}
      sx={{
        width: view === 'board' ? '250px' : '100%',
        p: 1.5,
        bgcolor: alpha(column.color, 0.1),
        borderRadius: 1,
        boxShadow: `0 1px 3px ${alpha(darken(column.color, 0.1), 0.1)}`,
        position: 'relative',
        '&:hover .add-column-btn': {
          visibility: 'visible',
        },
      }}
    >
      {!hideHeader && (
        <Box onClick={() => onOpenColumn(column)} sx={{ cursor: 'pointer', mb: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" sx={{ color: column.color }}>
              {column.title}
            </Typography>
            <Chip
              label={items.length}
              size="small"
              disabled
              sx={{
                '&.Mui-disabled': {
                  opacity: 1,
                },
              }}
            />
          </Stack>
        </Box>
      )}

      {items.map(item => (
        <div key={item.id}>
          {draggingItemId && hoverItemId === item.id && (
            <Box height={4} bgcolor={column.color} mb={0.5} borderRadius={2} />
          )}
          <TodoItemCard
            item={item}
            column={column}
            onOpen={onEditItem}
            onRename={onRenameItem}
            onDelete={onDeleteItem}
            onDragStart={onDragStart}
            onDragOver={onDragOverItem}
            startEditing={creatingId === item.id}
            onEditingEnd={finishCreate}
          />
        </div>
      ))}

      {draggingItemId && !hoverItemId && itemDropColumnId === column.id && (
        <Box height={4} bgcolor={column.color} mb={0.5} borderRadius={2} />
      )}

      {!creatingId && <AddItemInput columnId={column.id} onAdd={handleAddItem} />}

      <IconButton
        size="small"
        className="add-column-btn"
        onClick={() => onAddColumn(column.id)}
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          transform: 'translate(50%, -50%)',
          visibility: 'hidden',
          backgroundColor: theme => alpha(theme.palette.grey[500], 0.15), // neutral gray with opacity
          '&:hover': {
            backgroundColor: theme => alpha(theme.palette.grey[500], 0.25),
          },
        }}
      >
        <AddIcon fontSize="inherit" />
      </IconButton>

      <style jsx>{`
        .todo-column:hover .add-column-btn {
          visibility: visible;
        }
      `}</style>
    </Box>
  );
}
