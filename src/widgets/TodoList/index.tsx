import { useEffect, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { Box, Button, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { IEvent } from '@/types/IEvent';
import { filterFullDayEventsForTodayInUTC } from '@/utils/eventUtils';
import { getStoredFilters, setStoredFilters } from '@/utils/localStorageUtils';
import { AddColumnModal } from '@/widgets/TodoList/AddColumnModal';
import { LAST_POPULATE_KEY, loadBoard, saveBoard } from '@/widgets/TodoList/boardStorage';
import { EditItemModal } from '@/widgets/TodoList/EditItemModal';
import { TodoColumn } from '@/widgets/TodoList/TodoColumn';
import { BoardState, Column, TodoItem } from '@/widgets/TodoList/types';

interface TodoListProps {
  events: IEvent[] | null;
}

export function TodoList({ events }: TodoListProps) {
  const [board, setBoard] = useState<BoardState>(() => loadBoard());
  const [view, setView] = useState<'board' | 'list'>('board');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingColumnId, setDraggingColumnId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<TodoItem | null>(null);
  const [addingColumn, setAddingColumn] = useState(false);
  const theme = useTheme();

  // Populate tasks from today's events once per day
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

  // Persist board whenever it changes
  useEffect(() => {
    saveBoard(board);
  }, [board]);

  const handleAddItem = (columnId: string, title: string) => {
    const item: TodoItem = {
      id: `todo-${Date.now()}`,
      title,
      tags: [],
      columnId,
    };
    setBoard(prev => ({ ...prev, items: [...prev.items, item] }));
  };

  const handleEditItem = (id: string) => {
    const item = board.items.find(t => t.id === id);
    if (!item) return;
    setEditingItem(item);
  };

  const handleSaveItem = (updated: TodoItem) => {
    setBoard(prev => ({
      ...prev,
      items: prev.items.map(t => (t.id === updated.id ? updated : t)),
    }));
    setEditingItem(null);
  };

  const handleRenameItem = (id: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setBoard(prev => ({
      ...prev,
      items: prev.items.map(t => (t.id === id ? { ...t, title: trimmed } : t)),
    }));
  };

  const handleDeleteItem = (id: string) => {
    if (!window.confirm('Delete this item?')) return;
    setBoard(prev => ({ ...prev, items: prev.items.filter(t => t.id !== id) }));
  };

  const handleCompleteItem = (id: string) => {
    setBoard(prev => {
      const doneColumn =
        prev.columns.find(c => c.title.toLowerCase() === 'done') ||
        prev.columns.find(c => c.id === 'done');
      const columnId = doneColumn ? doneColumn.id : 'done';
      const columns = doneColumn
        ? prev.columns
        : [...prev.columns, { id: 'done', title: 'Done', color: '#2e7d32' }];
      const items = prev.items.map(t => (t.id === id ? { ...t, columnId } : t));
      return { columns, items };
    });
  };

  const handleAddColumn = (title: string, color: string) => {
    const id = `col-${Date.now()}`;
    setBoard(prev => ({ ...prev, columns: [...prev.columns, { id, title, color }] }));
  };

  const handleRenameColumn = (id: string) => {
    const column = board.columns.find(c => c.id === id);
    if (!column) return;
    const title = window.prompt('Column title', column.title)?.trim();
    if (!title) return;
    setBoard(prev => ({
      ...prev,
      columns: prev.columns.map(c => (c.id === id ? { ...c, title } : c)),
    }));
  };

  const handleDeleteColumn = (id: string) => {
    if (id === 'done') return;
    if (!window.confirm('Delete column and all its items?')) return;
    setBoard(prev => ({
      columns: prev.columns.filter(c => c.id !== id),
      items: prev.items.filter(i => i.columnId !== id),
    }));
  };

  const handleChangeColumnColor = (id: string) => {
    const column = board.columns.find(c => c.id === id);
    if (!column) return;
    const options = ['primary', 'secondary', 'success', 'info', 'warning', 'error'];
    const choice = window.prompt(`Color (${options.join(', ')})`, 'primary');
    if (!choice || !options.includes(choice)) return;

    const paletteColor =
      theme.palette[choice as 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error'];
    const color = 'main' in paletteColor ? paletteColor.main : '';
    setBoard(prev => ({
      ...prev,
      columns: prev.columns.map(c => (c.id === id ? { ...c, color } : c)),
    }));
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, id: string) => {
    event.dataTransfer.effectAllowed = 'move';
    setDraggingId(id);
  };

  const handleColumnDragStart = (event: React.DragEvent<HTMLDivElement>, id: string) => {
    event.dataTransfer.effectAllowed = 'move';
    setDraggingColumnId(id);
  };

  const handleColumnDragOver = (event: React.DragEvent<HTMLDivElement>, overId: string) => {
    if (!draggingColumnId || draggingColumnId === overId) return;
    setBoard(prev => {
      const columns = [...prev.columns];
      const from = columns.findIndex(c => c.id === draggingColumnId);
      const to = columns.findIndex(c => c.id === overId);
      if (from === -1 || to === -1) return prev;
      const [moved] = columns.splice(from, 1);
      columns.splice(to, 0, moved);
      return { ...prev, columns };
    });
  };

  const handleColumnDragEnd = () => {
    setDraggingColumnId(null);
  };

  const handleDragOverItem = (event: React.DragEvent<HTMLDivElement>, overId: string) => {
    event.preventDefault();
    if (!draggingId || draggingId === overId) return;

    setBoard(prev => {
      const items = [...prev.items];
      const from = items.findIndex(i => i.id === draggingId);
      const to = items.findIndex(i => i.id === overId);
      if (from === -1 || to === -1) return prev;
      const [moved] = items.splice(from, 1);
      items.splice(to, 0, moved);
      return { ...prev, items };
    });
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

  const renderColumn = (column: Column) => {
    const items = board.items.filter(i => i.columnId === column.id);
    return (
      <TodoColumn
        key={column.id}
        column={column}
        items={items}
        view={view}
        onRenameColumn={handleRenameColumn}
        onDeleteColumn={handleDeleteColumn}
        onChangeColor={handleChangeColumnColor}
        onEditItem={handleEditItem}
        onRenameItem={handleRenameItem}
        onDeleteItem={handleDeleteItem}
        onCompleteItem={handleCompleteItem}
        onAddItem={handleAddItem}
        onDragStart={handleDragStart}
        onDragOverItem={handleDragOverItem}
        onDrop={handleDrop}
        onColumnDragStart={handleColumnDragStart}
        onColumnDragOver={handleColumnDragOver}
        onColumnDragEnd={handleColumnDragEnd}
      />
    );
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Stack direction="row" spacing={1} mb={2} alignItems="center">
        <Box flexGrow={1} />
        <Button
          variant="outlined"
          size="small"
          startIcon={view === 'board' ? <ListIcon /> : <ViewColumnIcon />}
          onClick={() => setView(v => (v === 'board' ? 'list' : 'board'))}
        >
          {view === 'board' ? 'List view' : 'Board view'}
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setAddingColumn(true)}
        >
          Add Column
        </Button>
      </Stack>

      <Stack
        direction={view === 'board' ? 'row' : 'column'}
        spacing={2}
        sx={{ userSelect: 'none' }}
      >
        {board.columns.map(renderColumn)}
      </Stack>
      <EditItemModal
        open={Boolean(editingItem)}
        item={editingItem}
        onSave={handleSaveItem}
        onClose={() => setEditingItem(null)}
      />
      <AddColumnModal
        open={addingColumn}
        onAdd={handleAddColumn}
        onClose={() => setAddingColumn(false)}
      />

      <style jsx>{`
        .todo-actions {
          position: absolute;
          right: 0.25rem;
          top: 0.25rem;
        }
        [data-todo-id]:hover .todo-actions {
          visibility: visible;
        }
        .todo-actions button:hover {
          cursor: pointer;
        }
      `}</style>
    </Box>
  );
}
