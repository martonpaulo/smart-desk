import { useEffect, useState, useMemo } from 'react';

import CheckIcon from '@mui/icons-material/Check';
import UndoIcon from '@mui/icons-material/Undo';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Chip, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { alpha, darken } from '@mui/material/styles';

import { theme } from '@/styles/theme';
import { Column, TodoTask } from '@/widgets/TodoList/types';
import { loadTagPresets } from '@/utils/tagPresetsStorage';

interface TodoTaskCardProps {
  task: TodoTask;
  column: Column;
  onOpen: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onToggleDone: (id: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  startEditing?: boolean;
  onEditingEnd?: () => void;
}

export function TodoTaskCard({
  task,
  column,
  onOpen,
  onRename,
  onDelete,
  onToggleDone,
  onDragStart,
  onDragOver,
  startEditing = false,
  onEditingEnd,
}: TodoTaskCardProps) {
  const [editing, setEditing] = useState(Boolean(startEditing));
  const [title, setTitle] = useState(task.title);
  const tagColors = useMemo(() => {
    const map: Record<string, string> = {};
    loadTagPresets().forEach(p => {
      map[p.name] = p.color;
    });
    return map;
  }, []);

  useEffect(() => {
    if (startEditing) {
      setEditing(true);
      setTitle(task.title);
    }
  }, [startEditing, task.title]);

  const finishEditing = () => {
    const trimmed = title.trim();
    if (trimmed) {
      onRename(task.id, trimmed);
    } else if (!task.description && task.tags.length === 0) {
      onDelete(task.id);
    }
    setEditing(false);
    onEditingEnd?.();
  };

  return (
    <>
      <Box
        data-todo-id={task.id}
        role="button"
        aria-label={`Open task ${task.title}`}
        draggable
        onDragStart={e => {
          e.stopPropagation();
          onDragStart(e, task.id);
        }}
        onDragOver={e => onDragOver(e, task.id)}
        onClick={() => !editing && onOpen(task.id)}
        sx={{
          p: 1.5,
          borderRadius: 1,
          mb: 1,
          position: 'relative',
          bgcolor: alpha(darken(column.color, 0.2), 0.15),
          cursor: editing ? 'text' : 'pointer',
          touchAction: 'none',
          '&:hover .todo-actions': { visibility: 'visible' },
          '&:active': { cursor: 'grabbing' },
          boxShadow: `0 1px 3px ${alpha(darken(column.color, 0.1), 0.1)}`,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} flex={1}>
            {task.description && (
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
                aria-label={`View details of ${task.title}`}
                onClick={() => onOpen(task.id)}
                variant="body2"
                sx={{
                  maxWidth: '100%',
                  overflowWrap: 'anywhere',
                  whiteSpace: 'normal',
                  textDecoration: task.columnId === 'done' ? 'line-through' : 'none',
                }}
              >
                {task.title}
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
                    aria-label={`Rename task ${task.title}`}
                    onClick={e => {
                      e.stopPropagation();
                      setTitle(task.title);
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
                <Tooltip
                  title={task.columnId === 'done' ? 'Uncheck task' : 'Check task'}
                  enterTouchDelay={0}
                >
                  <IconButton
                    size="small"
                    aria-label={`Toggle task ${task.title}`}
                    onClick={e => {
                      e.stopPropagation();
                      onToggleDone(task.id);
                    }}
                    sx={{
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                      borderTopRightRadius: 1,
                      borderBottomRightRadius: 1,
                    }}
                  >
                    {task.columnId === 'done' ? (
                      <UndoIcon fontSize="inherit" />
                    ) : (
                      <CheckIcon fontSize="inherit" />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          )}
        </Stack>

        {task.tags.length > 0 && (
          <Box display="flex" flexWrap="wrap" gap={0.5} pt={1}>
            {task.tags.map(tag => (
              <Chip
                label={tag}
                key={tag}
                size="small"
                disabled
                sx={{
                  bgcolor: tagColors[tag] || alpha(column.color, 0.65),
                  boxShadow: `0 1px 3px ${alpha(darken(column.color, 0.1), 0.1)}`,
                  '&.Mui-disabled': {
                    color: theme =>
                      theme.palette.getContrastText(tagColors[tag] || alpha(column.color, 0.65)),
                    opacity: 1,
                  },
                }}
              />
            ))}
          </Box>
        )}
      </Box>

    </>
  );
}
