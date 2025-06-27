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
import { filterTodayEvents } from '@/utils/eventUtils';
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
const FULL_DAY_MS = 24 * 60 * 60 * 1000;

function loadTodos(): TodoItem[] {
  try {
    return getStoredFilters<TodoItem[]>(STORAGE_KEY) ?? [];
  } catch (err) {
    console.error('Failed to load todos', err);
    return [];
  }
}

function persistTodos(todos: TodoItem[]) {
  try {
    setStoredFilters(STORAGE_KEY, todos);
  } catch (err) {
    console.error('Failed to save todos', err);
  }
}

export function TodoList({ events }: TodoListProps) {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newText, setNewText] = useState('');

  useEffect(() => {
    const stored = loadTodos();
    let populated = stored;

    if (events) {
      const todays = filterTodayEvents(events);
      const fullDay = todays.filter(ev => {
        const start = new Date(ev.start).getTime();
        const end = new Date(ev.end).getTime();
        return end - start >= FULL_DAY_MS;
      });
      fullDay.forEach(ev => {
        if (!populated.some(t => t.id === ev.id)) {
          populated = [...populated, { id: ev.id, text: ev.title, completed: false }];
        }
      });
    }

    setTodos(populated);
  }, [events]);

  useEffect(() => {
    persistTodos(todos);
  }, [todos]);

  const handleAdd = () => {
    const text = newText.trim();
    if (!text) return;
    setTodos(prev => [...prev, { id: `todo-${Date.now()}`, text, completed: false }]);
    setNewText('');
  };

  const handleToggle = (id: string) => {
    setTodos(prev => {
      const updated = prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t));
      updated.sort((a, b) => Number(a.completed) - Number(b.completed));
      return updated;
    });
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
    if (!window.confirm(`Delete task "${todo.text}"?`)) return;
    setTodos(prev => prev.filter(t => t.id !== id));
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
