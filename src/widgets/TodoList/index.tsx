import { useEffect, useState } from 'react';

import ListIcon from '@mui/icons-material/List';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { Box, Button, Stack } from '@mui/material';

import { IEvent } from '@/types/IEvent';
import { filterFullDayEventsForTodayInUTC } from '@/utils/eventUtils';
import { getStoredFilters, setStoredFilters } from '@/utils/localStorageUtils';
import { ColumnModal } from '@/widgets/TodoList/ColumnModal';
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
  const [columnModal, setColumnModal] = useState<{
    column: Column | null;
    afterId?: string;
  } | null>(null);
  const [hoverItemId, setHoverItemId] = useState<string | null>(null);
  const [itemDropColumnId, setItemDropColumnId] = useState<string | null>(null);
  const [hoverColumnId, setHoverColumnId] = useState<string | null>(null);

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
    return item.id;
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

  const handleSaveColumn = (title: string, color: string) => {
    if (!columnModal) return;
    if (columnModal.column) {
      const id = columnModal.column.id;
      setBoard(prev => ({
        ...prev,
        columns: prev.columns.map(c => (c.id === id ? { ...c, title, color } : c)),
      }));
    } else {
      const id = `col-${Date.now()}`;
      setBoard(prev => {
        const columns = [...prev.columns];
        const index = columnModal.afterId
          ? columns.findIndex(c => c.id === columnModal.afterId) + 1
          : columns.length;
        columns.splice(index, 0, { id, title, color });
        return { ...prev, columns };
      });
    }
    setColumnModal(null);
  };

  const handleDeleteColumn = () => {
    if (!columnModal?.column || columnModal.column.id === 'done') {
      setColumnModal(null);
      return;
    }
    if (!window.confirm('Delete column and all its items?')) {
      setColumnModal(null);
      return;
    }
    const id = columnModal.column.id;
    setBoard(prev => ({
      columns: prev.columns.filter(c => c.id !== id),
      items: prev.items.filter(i => i.columnId !== id),
    }));
    setColumnModal(null);
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, id: string) => {
    event.dataTransfer.effectAllowed = 'move';
    setDraggingId(id);
    setHoverItemId(null);
    setItemDropColumnId(null);
  };

  const handleColumnDragStart = (event: React.DragEvent<HTMLDivElement>, id: string) => {
    event.dataTransfer.effectAllowed = 'move';
    setDraggingColumnId(id);
    setHoverColumnId(null);
  };

  const handleColumnDragOver = (event: React.DragEvent<HTMLDivElement>, overId: string) => {
    if (!draggingColumnId || draggingColumnId === overId) return;
    setHoverColumnId(overId);
  };

  const handleColumnDragEnd = () => {
    if (draggingColumnId) {
      setBoard(prev => {
        const columns = [...prev.columns];
        const from = columns.findIndex(c => c.id === draggingColumnId);
        const to = hoverColumnId ? columns.findIndex(c => c.id === hoverColumnId) : from;
        if (from === -1 || to === -1 || from === to) return prev;
        const [moved] = columns.splice(from, 1);
        columns.splice(to, 0, moved);
        return { ...prev, columns };
      });
    }
    setDraggingColumnId(null);
    setHoverColumnId(null);
  };

  const handleDragOverItem = (event: React.DragEvent<HTMLDivElement>, overId: string) => {
    event.preventDefault();
    if (!draggingId || draggingId === overId) return;
    setHoverItemId(overId);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, columnId: string) => {
    event.preventDefault();
    const id = draggingId;
    setDraggingId(null);
    const overId = hoverItemId;
    setHoverItemId(null);
    setItemDropColumnId(null);
    if (!id) return;
    setBoard(prev => {
      const items = [...prev.items];
      const from = items.findIndex(i => i.id === id);
      if (from === -1) return prev;
      const [moved] = items.splice(from, 1);
      const to = overId
        ? items.findIndex(i => i.id === overId)
        : items.reduce((idx, it, i) => (it.columnId === columnId ? i + 1 : idx), 0);
      const insertIndex = from < to ? to - 1 : to;
      items.splice(insertIndex, 0, { ...moved, columnId });
      return { ...prev, items };
    });
  };

  const renderColumn = (column: Column) => {
    const items = board.items.filter(i => i.columnId === column.id);
    return (
      <TodoColumn
        key={column.id}
        column={column}
        items={items}
        view={view}
        onOpenColumn={col => setColumnModal({ column: col })}
        onAddColumn={afterId => setColumnModal({ column: null, afterId })}
        onEditItem={handleEditItem}
        onRenameItem={handleRenameItem}
        onDeleteItem={handleDeleteItem}
        onCompleteItem={handleCompleteItem}
        onAddItem={handleAddItem}
        onDragStart={handleDragStart}
        onDragOverItem={handleDragOverItem}
        onItemColumnDragOver={setItemDropColumnId}
        onDrop={handleDrop}
        onColumnDragStart={handleColumnDragStart}
        onColumnDragOver={handleColumnDragOver}
        onColumnDragEnd={handleColumnDragEnd}
        draggingItemId={draggingId}
        hoverItemId={hoverItemId}
        itemDropColumnId={itemDropColumnId}
        draggingColumnId={draggingColumnId}
        hoverColumnId={hoverColumnId}
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
      <ColumnModal
        open={Boolean(columnModal)}
        column={columnModal?.column || null}
        onSave={handleSaveColumn}
        onDelete={handleDeleteColumn}
        onClose={() => setColumnModal(null)}
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
