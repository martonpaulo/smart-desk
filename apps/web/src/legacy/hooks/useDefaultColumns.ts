import { defaultColumns } from 'src/features/column/config/defaultColumns';
import { useBoardStore } from 'src/legacy/store/board/store';

type ColumnKey = keyof typeof defaultColumns;

/**
 * Ensures a default column exists and is active.
 * Creates it if missing, restores it if trashed.
 */
export function useDefaultColumns(columnKey: ColumnKey) {
  const addColumn = useBoardStore(s => s.addColumn);
  const updateColumn = useBoardStore(s => s.updateColumn);

  // guard against invalid keys
  if (!defaultColumns[columnKey]) {
    const msg = `[useDefaultColumns] Unknown column key: "${columnKey}"`;
    console.error(msg);
    throw new Error(msg);
  }

  /**
   * Initialize or restore the column for the given key
   */
  async function initializeColumn(key: ColumnKey) {
    const { title, color } = defaultColumns[key];
    const state = useBoardStore.getState();
    let column = state.columns.find(c => c.title === title);

    // create if not found
    if (!column) {
      await addColumn({ title, color, updatedAt: new Date() });
      column = useBoardStore.getState().columns.find(c => c.title === title);
    }

    // restore if trashed
    if (column?.trashed) {
      await updateColumn({
        id: column.id,
        trashed: false,
        updatedAt: new Date(),
      });
      column = useBoardStore.getState().columns.find(c => c.id === column?.id);
    }

    // ensure we have a column
    if (!column) {
      throw new Error(`[useDefaultColumns] Failed to init column "${title}"`);
    }

    return column;
  }

  return initializeColumn(columnKey);
}
