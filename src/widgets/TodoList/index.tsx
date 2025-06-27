import { useEffect, useState } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { IEvent } from '@/types/IEvent';
import { filterFullDayEventsForTodayInUTC } from '@/utils/eventUtils';
import { getStoredFilters, setStoredFilters } from '@/utils/localStorageUtils';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoListProps {
  events: IEvent[] | null;
}

const STORAGE_KEY = 'todo-list';
const LAST_POPULATE_KEY = 'todo-last-populate';

function loadTodos(): TodoItem[] {
  try {
    return getStoredFilters<TodoItem[]>(STORAGE_KEY) || [];
  } catch {
    return [];
  }
}

export function TodoList({ events }: TodoListProps) {
  const [todos, setTodos] = useState<TodoItem[]>(() => loadTodos());
  const [newText, setNewText] = useState('');

  useEffect(() => {
    // sai se não houver nada carregado ainda
    if (!events?.length) return;

    const todayKey = new Date().toISOString().slice(0, 10);
    const lastPopulate = getStoredFilters<string>(LAST_POPULATE_KEY);

    // sai se já fizemos seed hoje
    if (lastPopulate === todayKey) return;

    const fullDay = filterFullDayEventsForTodayInUTC(events);

    // sai se não há full-day events novos
    if (!fullDay.length) return;

    setTodos(prev => {
      const additions = fullDay
        .filter(ev => !prev.some(t => t.id === ev.id))
        .map(ev => ({
          id: ev.id,
          text: ev.title,
          completed: false,
        }));

      if (!additions.length) return prev;

      const updated = [...prev, ...additions];
      setStoredFilters(STORAGE_KEY, updated);
      return updated;
    });

    // só marca como populado depois do seed
    setStoredFilters(LAST_POPULATE_KEY, todayKey);
  }, [events]);

  // persist on any change
  useEffect(() => {
    try {
      setStoredFilters(STORAGE_KEY, todos);
    } catch {
      console.error('Could not save todos');
    }
  }, [todos]);

  const handleAdd = () => {
    const text = newText.trim();
    if (!text) return;
    const newTodo = {
      id: `todo-${Date.now()}`,
      text,
      completed: false,
    };
    setTodos(prev => [...prev, newTodo]);
    setNewText('');
  };

  const handleToggle = (id: string) => {
    setTodos(prev =>
      prev
        .map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
        .sort((a, b) => Number(a.completed) - Number(b.completed)),
    );
  };

  const handleEdit = (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    const text = window.prompt('Edit task', todo.text);
    if (text != null) {
      const trimmed = text.trim();
      if (trimmed) {
        setTodos(prev => prev.map(t => (t.id === id ? { ...t, text: trimmed } : t)));
      }
    }
  };

  const handleDelete = (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    if (window.confirm(`Delete task "${todo.text}"?`)) {
      setTodos(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Todo List
      </Typography>
      <List dense>
        {todos.map(todo => (
          <ListItem key={todo.id} disableGutters>
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={todo.completed}
                onChange={() => handleToggle(todo.id)}
              />
            </ListItemIcon>
            <ListItemText
              primary={todo.text}
              sx={{
                textDecoration: todo.completed ? 'line-through' : 'none',
                opacity: todo.completed ? 0.5 : 1,
              }}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(todo.id)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(todo.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
        {todos.length === 0 && (
          <ListItem>
            <ListItemText primary="No tasks" />
          </ListItem>
        )}
      </List>

      <Stack direction="row" spacing={1} mt={1}>
        <TextField
          label="New task"
          value={newText}
          onChange={e => setNewText(e.target.value)}
          onKeyDown={handleInputKey}
          fullWidth
        />
        <Button variant="contained" onClick={handleAdd}>
          Add
        </Button>
      </Stack>
    </Box>
  );
}

export default TodoList;
