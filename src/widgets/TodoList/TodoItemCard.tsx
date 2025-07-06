import { useEffect, useState } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, darken } from '@mui/material/styles';

import { theme } from '@/styles/theme';
import { Column, TodoItem } from '@/widgets/TodoList/types';

interface TodoItemCardProps {
  item: TodoItem;
  column: Column;
  onOpen: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
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
  onDragStart,
  onDragOver,
  startEditing = false,
  onEditingEnd,
}: TodoItemCardProps) {
  const [editing, setEditing] = useState(Boolean(startEditing));
  const [title, setTitle] = useState(item.title);
  const [confirmOpen, setConfirmOpen] = useState(false);

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
    <>
      <Box
        data-todo-id={item.id}
        role="button"
        aria-label={`Open task ${item.title}`}
        draggable
        onDragStart={e => {
          e.stopPropagation();
          onDragStart(e, item.id);
        }}
        onDragOver={e => onDragOver(e, item.id)}
        onClick={() => !editing && onOpen(item.id)}
        sx={{
          p: 1.5,
          borderRadius: 1,
          mb: 1,
          position: 'relative',
          bgcolor: alpha(darken(column.color, 0.2), 0.15),
          cursor: editing ? 'text' : 'pointer',
          '&:hover .todo-actions': { visibility: 'visible' },
          '&:active': { cursor: 'grabbing' },
          boxShadow: `0 1px 3px ${alpha(darken(column.color, 0.1), 0.1)}`,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} flex={1}>
            {item.description && (
              <Tooltip title="Has description" enterTouchDelay={0}>
                <DescriptionOutlinedIcon
                  aria-hidden="true"
                  fontSize="inherit"
                  sx={{ color: 'text.secondary', position: 'relative', top: 1 }}
                />
              </Tooltip>
            )}

            {editing ? (
              <TextField
                fullWidth
                multiline
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
                slotProps={{
                  input: {
                    sx: theme => ({
                      font: theme.typography.body2.fontFamily,
                      fontSize: theme.typography.body2.fontSize,
                      lineHeight: theme.typography.body2.lineHeight,
                      fontWeight: theme.typography.body2.fontWeight,
                    }),
                  },
                }}
              />
            ) : (
              <Typography
                role="button"
                aria-label={`View details of ${item.title}`}
                onClick={() => onOpen(item.id)}
                variant="body2"
                sx={{ maxWidth: '100%', overflowWrap: 'anywhere', whiteSpace: 'normal' }}
              >
                {item.title}
              </Typography>
            )}
          </Stack>

          {!editing && (
            <Box
              className="todo-actions"
              sx={{
                position: 'absolute',
                top: 8,
                borderRadius: 1,
                right: 6,
                zIndex: 2,
                display: 'flex',
                visibility: 'hidden',
                '& button': { cursor: 'pointer', p: 0.5 },
              }}
            >
              <Box sx={{ backgroundColor: theme.palette.grey[100], borderRadius: 1, opacity: 0.9 }}>
                <Tooltip title="Rename task" enterTouchDelay={0}>
                  <IconButton
                    size="small"
                    aria-label={`Rename task ${item.title}`}
                    onClick={e => {
                      e.stopPropagation();
                      setTitle(item.title);
                      setEditing(true);
                    }}
                    sx={{
                      borderTopLeftRadius: 1,
                      borderBottomLeftRadius: 1,
                      borderTopRightRadius: 0,
                      borderBottomRightRadius: 0,
                    }}
                  >
                    <EditIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete task" enterTouchDelay={0}>
                  <IconButton
                    size="small"
                    aria-label={`Delete task ${item.title}`}
                    onClick={e => {
                      e.stopPropagation();
                      setConfirmOpen(true);
                    }}
                    sx={{
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                      borderTopRightRadius: 1,
                      borderBottomRightRadius: 1,
                    }}
                  >
                    <DeleteIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          )}
        </Stack>

        {item.tags.length > 0 && (
          <Box display="flex" flexWrap="wrap" gap={0.5} pt={1}>
            {item.tags.map(tag => (
              <Chip
                label={tag}
                key={tag}
                size="small"
                disabled
                sx={{
                  bgcolor: alpha(column.color, 0.65),
                  boxShadow: `0 1px 3px ${alpha(darken(column.color, 0.1), 0.1)}`,
                  '&.Mui-disabled': {
                    color: theme => theme.palette.getContrastText(alpha(column.color, 0.65)),
                    opacity: 1,
                  },
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onDelete(item.id);
            setConfirmOpen(false);
          }
        }}
      >
        <DialogTitle>Delete item</DialogTitle>
        <DialogContent>
          Are you sure you want to delete <b>{item.title}</b>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            color="error"
            onClick={() => {
              onDelete(item.id);
              setConfirmOpen(false);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
