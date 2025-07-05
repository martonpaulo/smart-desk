import { useEffect, useState } from 'react';

import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Chip, IconButton, Stack, TextField, Typography } from '@mui/material';
import { alpha, darken } from '@mui/material/styles';

import { Column, TodoItem } from '@/widgets/TodoList/types';

interface TodoItemCardProps {
  item: TodoItem;
  column: Column;
  onOpen: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  startEditing?: boolean;
  onEditingEnd?: () => void;
}

export function TodoItemCard({
  item,
  column,
  onOpen,
  onRename,
  onDelete,
  onComplete,
  onDragStart,
  onDragOver,
}: TodoItemCardProps) {
  const [editing, setEditing] = useState(Boolean(startEditing));
  const [title, setTitle] = useState(item.title);

  useEffect(() => {
    if (startEditing) {
      setEditing(true);
      setTitle(item.title);
    }
  }, [startEditing, item.title]);

  const finishEditing = () => {
    const trimmed = title.trim();
    if (trimmed) onRename(item.id, trimmed);
    setEditing(false);
    onEditingEnd?.();
  };

  return (
    <Box
      data-todo-id={item.id}
      draggable
      onDragStart={e => {
        e.stopPropagation();
        onDragStart(e, item.id);
      }}
      onDragOver={e => onDragOver(e, item.id)}
      onClick={() => !editing && onOpen(item.id)}
      sx={{
        p: 1,
        borderRadius: 1,
        mb: 1,
        position: 'relative',
        bgcolor: alpha(darken(column.color, 0.2), 0.15),
        cursor: editing ? 'text' : 'grab',
        '&:hover .todo-actions': {
          visibility: 'visible',
        },
        '&:active': {
          cursor: 'grabbing',
        },
        boxShadow: 1,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" alignItems="center">
          {item.description && (
            <IconButton size="small" disabled>
              <DescriptionIcon fontSize="inherit" />
            </IconButton>
          )}

          {editing ? (
            <TextField
              size="small"
              value={title}
              autoFocus
              variant="standard"
              onBlur={finishEditing}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.stopPropagation();
                  finishEditing();
                }
              }}
            />
          ) : (
            <Typography onClick={() => onOpen(item.id)}>{item.title}</Typography>
          )}
        </Stack>
        <Stack
          direction="row"
          sx={{ visibility: 'hidden', '& button': { cursor: 'pointer' } }}
          className="todo-actions"
        >
          {editing ? (
            <IconButton
              size="small"
              onClick={e => {
                e.stopPropagation();
                finishEditing();
              }}
            >
              <CheckIcon fontSize="inherit" />
            </IconButton>
          ) : (
            <>
              <IconButton
                size="small"
                onClick={e => {
                  e.stopPropagation();
                  setTitle(item.title);
                  setEditing(true);
                }}
              >
                <EditIcon fontSize="inherit" />
              </IconButton>
              {column.id !== 'done' && (
                <IconButton
                  size="small"
                  onClick={e => {
                    e.stopPropagation();
                    onComplete(item.id);
                  }}
                >
                  <CheckIcon fontSize="inherit" />
                </IconButton>
              )}
              <IconButton
                size="small"
                onClick={e => {
                  e.stopPropagation();
                  if (window.confirm('Delete item?')) onDelete(item.id);
                }}
                color="error"
              >
                <DeleteIcon fontSize="inherit" />
              </IconButton>
            </>
          )}
        </Stack>
      </Stack>
      <Stack direction="row" spacing={1} mt={0.5} flexWrap="wrap">
        {item.tags.map(tag => (
          <Chip key={tag} label={tag} size="small" />
        ))}
      </Stack>
    </Box>
  );
}
