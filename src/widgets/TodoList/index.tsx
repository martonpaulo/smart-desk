import { useEffect, useRef, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ListIcon from '@mui/icons-material/List';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';

import type { IEvent } from '@/types/IEvent';
import { filterFullDayEventsForTodayInUTC } from '@/utils/eventUtils';
import { getStoredFilters, setStoredFilters } from '@/utils/localStorageUtils';

interface Column {
  id: string;
  title: string;
  color: string;
}

interface TodoItem {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  columnId: string;
}

interface BoardState {
  columns: Column[];
  items: TodoItem[];
}

interface TodoListProps {
  events: IEvent[] | null;
}

const STORAGE_KEY = 'todo-board';
const LAST_POPULATE_KEY = 'todo-last-populate';
const DEFAULT_COLUMNS: Column[] = [
  { id: 'todo', title: 'Todo', color: '#1976d2' },
  { id: 'completed', title: 'Completed', color: '#2e7d32' },
];

function loadBoard(): BoardState {
  try {
    return (
      getStoredFilters<BoardState>(STORAGE_KEY) || { columns: DEFAULT_COLUMNS, items: [] }
    );
  } catch {
    return { columns: DEFAULT_COLUMNS, items: [] };
  }
}

function saveBoard(board: BoardState): void {
  try {
    setStoredFilters(STORAGE_KEY, board);
  } catch {
    console.error('Could not save todo board');
  }
}

export function TodoList({ events }: TodoListProps) {
  const [board, setBoard] = useState<BoardState>(() => loadBoard());
  const [view, setView] = useState<'board' | 'list'>('board');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTags, setNewTags] = useState('');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectRect, setSelectRect] = useState<DOMRect | null>(null);
  const selectionRef = useRef<HTMLDivElement>(null);
  const { palette } = useTheme();

  // Populate with today's all day events only once per day
  useEffect(() => {
    if (!events?.length) return;

    const todayKey = new Date().toISOString().slice(0, 10);
    const lastPopulate = getStoredFilters<string>(LAST_POPULATE_KEY);
    if (lastPopulate === todayKey) return;

    const fullDay = filterFullDayEventsForTodayInUTC(events);
    if (!fullDay.length) return;

    setBoard(prev => {
      const additions = fullDay
        .filter(ev => !prev.items.some(t => t.id === ev.id))
        .map(ev => ({
          id: ev.id,
          title: ev.title,
          description: undefined,
          tags: [],
          columnId: 'todo',
        }));
      if (!additions.length) return prev;
      const updated = { ...prev, items: [...prev.items, ...additions] };
      saveBoard(updated);
      return updated;
    });

    setStoredFilters(LAST_POPULATE_KEY, todayKey);
  }, [events]);

  // Persist board on change
  useEffect(() => {
    saveBoard(board);
  }, [board]);

  const handleAddItem = () => {
    const title = newTitle.trim();
    if (!title) return;
    const item: TodoItem = {
      id: `todo-${Date.now()}`,
      title,
      description: newDescription.trim() || undefined,
      tags: newTags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean),
      columnId: 'todo',
    };
    setBoard(prev => ({ ...prev, items: [...prev.items, item] }));
    setNewTitle('');
    setNewDescription('');
    setNewTags('');
  };

  const handleEditItem = (id: string) => {
    const item = board.items.find(t => t.id === id);
    if (!item) return;
    const title = window.prompt('Edit title', item.title) ?? '';
    if (!title.trim()) return;
    const description = window.prompt('Edit description', item.description || '') ?? '';
    const tagsString = window.prompt('Edit tags comma separated', item.tags.join(', ')) ?? '';

    const tags = tagsString
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    setBoard(prev => ({
      ...prev,
      items: prev.items.map(t =>
        t.id === id ? { ...t, title: title.trim(), description: description.trim() || undefined, tags } : t,
      ),
    }));
  };

  const handleDeleteItem = (id: string) => {
    setBoard(prev => ({ ...prev, items: prev.items.filter(t => t.id !== id) }));
  };

  const handleCompleteItem = (id: string) => {
    setBoard(prev => {
      const completedColumn =
        prev.columns.find(c => c.title.toLowerCase() === 'completed') || prev.columns.find(c => c.id === 'completed');
      const columnId = completedColumn ? completedColumn.id : 'completed';
      const columns = completedColumn
        ? prev.columns
        : [...prev.columns, { id: 'completed', title: 'Completed', color: '#2e7d32' }];
      const items = prev.items.map(t => (t.id === id ? { ...t, columnId } : t));
      return { columns, items };
    });
  };

  const handleAddColumn = () => {
    const title = window.prompt('New column title');
    if (!title) return;
    const color = window.prompt('Column color (css color value)', '#1976d2') || '#1976d2';
    const id = `col-${Date.now()}`;
    setBoard(prev => ({ ...prev, columns: [...prev.columns, { id, title, color }] }));
  };

  const handleRenameColumn = (id: string) => {
    const column = board.columns.find(c => c.id === id);
    if (!column) return;
    const title = window.prompt('Column title', column.title);
    if (!title) return;
    setBoard(prev => ({
      ...prev,
      columns: prev.columns.map(c => (c.id === id ? { ...c, title } : c)),
    }));
  };

  const handleDeleteColumn = (id: string) => {
    if (!window.confirm('Delete column and all its items?')) return;
    setBoard(prev => ({
      columns: prev.columns.filter(c => c.id !== id),
      items: prev.items.filter(i => i.columnId !== id),
    }));
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, id: string) => {
    event.dataTransfer.effectAllowed = 'move';
    setDraggingId(id);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, columnId: string) => {
    event.preventDefault();
    const id = draggingId;
    setDraggingId(null);
    if (!id) return;
    setBoard(prev => ({
      ...prev,
      items: prev.items.map(item => (item.id === id ? { ...item, columnId } : item)),
    }));
  };

  const startSelection = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.button !== 0) return;
    const rect = (e.target as HTMLDivElement).getBoundingClientRect();
    setSelectRect(new DOMRect(e.clientX - rect.left, e.clientY - rect.top, 0, 0));
  };

  const updateSelection = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!selectRect) return;
    const rect = selectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRect = new DOMRect(
      Math.min(selectRect.x, x),
      Math.min(selectRect.y, y),
      Math.abs(x - selectRect.x),
      Math.abs(y - selectRect.y),
    );
    setSelectRect(newRect);

    const boxes = Array.from(document.querySelectorAll('[data-todo-id]')) as HTMLDivElement[];
    const newlySelected = boxes
      .filter(el => {
        const r = el.getBoundingClientRect();
        const withinX = r.left < newRect.x + newRect.width + rect.left && r.right > newRect.x + rect.left;
        const withinY = r.top < newRect.y + newRect.height + rect.top && r.bottom > newRect.y + rect.top;
        return withinX && withinY;
      })
      .map(el => el.dataset.todoId!) as string[];
    setSelectedIds(newlySelected);
  };

  const endSelection = () => {
    setSelectRect(null);
  };

  const renderItem = (item: TodoItem) => {
    const column = board.columns.find(c => c.id === item.columnId);
    if (!column) return null;

    const isSelected = selectedIds.includes(item.id);

    return (
      <Box
        key={item.id}
        data-todo-id={item.id}
        draggable
        onDragStart={e => handleDragStart(e, item.id)}
        sx={{
          p: 1,
          bgcolor: isSelected ? alpha(column.color, 0.2) : 'background.paper',
          border: '1px solid',
          borderColor: column.color,
          borderRadius: 1,
          mb: 1,
          position: 'relative',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body1">{item.title}</Typography>
            {item.description && (
              <Tooltip title="Has description">
                <AddIcon fontSize="small" />
              </Tooltip>
            )}
          </Stack>
          <Stack direction="row" spacing={1} sx={{ visibility: 'hidden' }} className="todo-actions">
            <IconButton size="small" onClick={() => handleEditItem(item.id)}>
              <EditIcon fontSize="inherit" />
            </IconButton>
            <IconButton size="small" onClick={() => handleCompleteItem(item.id)}>
              <CheckIcon fontSize="inherit" />
            </IconButton>
            <IconButton size="small" onClick={() => handleDeleteItem(item.id)}>
              <DeleteIcon fontSize="inherit" />
            </IconButton>
          </Stack>
        </Stack>
        <Stack direction="row" spacing={1} mt={0.5} flexWrap="wrap">
          {item.tags.map(tag => (
            <Chip key={tag} label={tag} size="small" />
          ))}
        </Stack>
      </Box>
    );
  };

  const renderColumn = (column: Column) => {
    const items = board.items.filter(i => i.columnId === column.id);
    return (
      <Box
        key={column.id}
        onDragOver={e => e.preventDefault()}
        onDrop={e => handleDrop(e, column.id)}
        sx={{ width: 250, p: 1, bgcolor: alpha(column.color, 0.1), borderRadius: 1 }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="h6" sx={{ color: column.color }}>
            {column.title}
          </Typography>
          <Stack direction="row" spacing={0}>
            <IconButton size="small" onClick={() => handleRenameColumn(column.id)}>
              <EditIcon fontSize="inherit" />
            </IconButton>
            <IconButton size="small" onClick={() => handleDeleteColumn(column.id)}>
              <DeleteIcon fontSize="inherit" />
            </IconButton>
          </Stack>
        </Stack>
        {items.map(renderItem)}
      </Box>
    );
  };

  const renderList = () => {
    return board.columns.map(col => (
      <Box key={col.id} mb={2}>
        <Typography variant="h6" sx={{ color: col.color }}>
          {col.title}
        </Typography>
        {board.items
          .filter(i => i.columnId === col.id)
          .map(item => (
            <Box key={item.id} mb={1}>
              {renderItem(item)}
            </Box>
          ))}
      </Box>
    ));
  };

  return (
    <Box ref={selectionRef} sx={{ position: 'relative' }}>
      <Stack direction="row" spacing={1} mb={2}>
        <Typography variant="h6">Todo List</Typography>
        <Box flexGrow={1} />
        <Button
          variant="outlined"
          size="small"
          startIcon={view === 'board' ? <ListIcon /> : <ViewColumnIcon />}
          onClick={() => setView(v => (v === 'board' ? 'list' : 'board'))}
        >
          {view === 'board' ? 'List view' : 'Board view'}
        </Button>
        <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={handleAddColumn}>
          Add Column
        </Button>
      </Stack>

      {view === 'board' ? (
        <Stack
          direction="row"
          spacing={2}
          onMouseDown={startSelection}
          onMouseMove={updateSelection}
          onMouseUp={endSelection}
          sx={{ userSelect: 'none' }}
        >
          {board.columns.map(renderColumn)}
        </Stack>
      ) : (
        <Box>{renderList()}</Box>
      )}

      {selectRect && (
        <Box
          sx={{
            position: 'absolute',
            border: `1px dashed ${palette.primary.main}`,
            bgcolor: alpha(palette.primary.main, 0.1),
            left: selectRect.x,
            top: selectRect.y,
            width: selectRect.width,
            height: selectRect.height,
            pointerEvents: 'none',
          }}
        />
      )}

      <Stack mt={2} spacing={1}>
        <TextField
          label="Title"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
        />
        <TextField
          label="Description"
          value={newDescription}
          onChange={e => setNewDescription(e.target.value)}
        />
        <TextField
          label="Tags (comma separated)"
          value={newTags}
          onChange={e => setNewTags(e.target.value)}
        />
        <Button variant="contained" onClick={handleAddItem} startIcon={<AddIcon />}>Add Item</Button>
      </Stack>

      <style jsx>{`
        .todo-actions {
          position: absolute;
          right: 0.25rem;
          top: 0.25rem;
        }
        [data-todo-id]:hover .todo-actions {
          visibility: visible;
        }
      `}</style>
    </Box>
  );
}

export default TodoList;

