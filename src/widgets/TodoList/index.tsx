import { useEffect, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';

import { filterFullDayEventsForTodayInUTC } from '@/utils/eventUtils';
import { getStoredFilters, setStoredFilters } from '@/utils/localStorageUtils';
import { LAST_POPULATE_KEY, loadBoard, saveBoard } from '@/widgets/TodoList/boardStorage';
import { TodoColumn } from '@/widgets/TodoList/TodoColumn';
import { EditItemModal } from '@/widgets/TodoList/EditItemModal';
import { BoardState, Column, TodoItem, TodoListProps } from '@/widgets/TodoList/types';

export function TodoList({ events }: TodoListProps) {
  const [board, setBoard] = useState<BoardState>(() => loadBoard());
  const [view, setView] = useState<'board' | 'list'>('board');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingColumnId, setDraggingColumnId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<TodoItem | null>(null);

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

  const handleDeleteItem = (id: string) => {
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

  const handleChangeColumnColor = (id: string) => {
    const column = board.columns.find(c => c.id === id);
    if (!column) return;
    const color = window.prompt('Column color', column.color) || column.color;
    setBoard(prev => ({
      ...prev,
      columns: prev.columns.map(c => (c.id === id ? { ...c, color } : c)),
    }));
  };

  const handleClearCompleted = () => {
    setBoard(prev => ({ ...prev, items: prev.items.filter(i => i.columnId !== 'done') }));
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

  const filteredItems = board.items.filter(item => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(term) || item.tags.some(t => t.toLowerCase().includes(term))
    );
  });

  const renderColumn = (column: Column) => {
    const items = filteredItems.filter(i => i.columnId === column.id);
    return (
      <TodoColumn
        key={column.id}
        column={column}
        items={items}
        onRenameColumn={handleRenameColumn}
        onDeleteColumn={handleDeleteColumn}
        onChangeColor={handleChangeColumnColor}
        onEditItem={handleEditItem}
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

  const renderList = () => {
    return board.columns.map(col => (
      <Box key={col.id} mb={2}>
        <Typography variant="h6" sx={{ color: col.color }}>
          {col.title}
        </Typography>
        {filteredItems
          .filter(i => i.columnId === col.id)
          .map(item => (
            <Box key={item.id} mb={1}>
              <TodoColumn
                column={col}
                items={[item]}
                onRenameColumn={() => undefined}
                onDeleteColumn={() => undefined}
                onEditItem={handleEditItem}
                onDeleteItem={handleDeleteItem}
                onCompleteItem={handleCompleteItem}
                onDragStart={handleDragStart}
                onDragOverItem={handleDragOverItem}
                onDrop={handleDrop}
                onAddItem={() => undefined}
                onChangeColor={() => undefined}
                hideHeader
              />
            </Box>
          ))}
      </Box>
    ));
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Stack direction="row" spacing={1} mb={2} alignItems="center">
        <Typography variant="h6">Todo List</Typography>
        <TextField
          size="small"
          placeholder="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Box flexGrow={1} />
        <Button variant="outlined" size="small" onClick={handleClearCompleted}>
          Clear Completed
        </Button>
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
        <Stack direction="row" spacing={2} sx={{ userSelect: 'none' }}>
          {board.columns.map(renderColumn)}
        </Stack>
      ) : (
        <Box>{renderList()}</Box>
      )}
      <EditItemModal
        open={Boolean(editingItem)}
        item={editingItem}
        onSave={handleSaveItem}
        onClose={() => setEditingItem(null)}
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
