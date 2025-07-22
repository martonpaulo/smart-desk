import { useState } from 'react';

export function useTaskSelection() {
  const [isSelecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelecting = () => {
    setSelecting(prev => !prev);
    setSelectedIds(new Set());
  };

  const selectTask = (id: string, selected: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const selectedCount = selectedIds.size;

  return {
    isSelecting,
    selectedIds,
    selectedCount,
    toggleSelecting,
    selectTask,
    clearSelection,
  };
}
