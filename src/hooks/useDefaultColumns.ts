import { useBoardStore } from '@/store/board/store';
import { defaultColumns } from '@/widgets/TodoList/defaultColumns';

type ColumnKey = keyof typeof defaultColumns;

export function useDefaultColumns(columnKey: ColumnKey) {
  const addColumn = useBoardStore(s => s.addColumn);
  const updateColumn = useBoardStore(s => s.updateColumn);
  const allColumns = useBoardStore(state => state.columns);

  const initializeDraftColumn = async () => {
    let draftCol = allColumns.find(c => c.title === defaultColumns.draft.title);

    if (!draftCol) {
      await addColumn({
        title: defaultColumns.draft.title,
        color: defaultColumns.draft.color,
        updatedAt: new Date(),
      });
      draftCol = allColumns.find(c => c.title === defaultColumns.draft.title);
    }

    if (draftCol && draftCol.trashed) {
      await updateColumn({ id: draftCol.id, trashed: false, updatedAt: new Date() });
    }

    return draftCol;
  };

  const initializeDoneColumn = async () => {
    let doneCol = allColumns.find(c => c.title === defaultColumns.done.title);

    if (!doneCol) {
      await addColumn({
        title: defaultColumns.done.title,
        color: defaultColumns.done.color,
        updatedAt: new Date(),
      });
      doneCol = allColumns.find(c => c.title === defaultColumns.done.title);
    }

    if (doneCol && doneCol.trashed) {
      await updateColumn({ id: doneCol.id, trashed: false, updatedAt: new Date() });
    }

    return doneCol;
  };

  const initializeTodoColumn = async () => {
    let todoCol = allColumns.find(c => c.title === defaultColumns.todo.title);

    if (!todoCol) {
      await addColumn({
        title: defaultColumns.todo.title,
        color: defaultColumns.todo.color,
        updatedAt: new Date(),
      });
      todoCol = allColumns.find(c => c.title === defaultColumns.todo.title);
    }

    if (todoCol && todoCol.trashed) {
      await updateColumn({ id: todoCol.id, trashed: false, updatedAt: new Date() });
    }

    return todoCol;
  };

  if (columnKey === 'draft') return initializeDraftColumn();
  if (columnKey === 'done') return initializeDoneColumn();
  if (columnKey === 'todo') return initializeTodoColumn();

  if (Object.keys(defaultColumns).includes(columnKey)) {
    throw new Error(`Column ${columnKey} is not implemented in useDefaultColumns`);
  } else {
    console.error(`Unknown column key: ${columnKey}`);
    throw new Error(`Unknown column key: ${columnKey}`);
  }
}
