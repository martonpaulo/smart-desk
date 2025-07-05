export interface Column {
  id: string;
  title: string;
  color: string;
}

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  columnId: string;
}

export interface BoardState {
  columns: Column[];
  items: TodoItem[];
}

export interface TodoListProps {
  events: import('@/types/IEvent').IEvent[] | null;
}
