export interface Column {
  id: string;
  title: string;
  color: string;
}

export interface TodoTask {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  columnId: string;
  quantity?: number;
  quantityTotal?: number;
  prevColumnId?: string;
}

export interface BoardState {
  columns: Column[];
  tasks: TodoTask[];
  trash: {
    columns: Column[];
    tasks: TodoTask[];
  };
}
