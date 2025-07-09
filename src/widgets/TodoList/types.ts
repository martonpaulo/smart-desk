export interface Column {
  id?: string;
  slug: string;
  title: string;
  color: string;
  position?: number;
}

export interface TodoTask {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  columnSlug: string;
  quantity?: number;
  quantityTotal?: number;
  prevColumnSlug?: string;
  position?: number;
}

export interface BoardState {
  columns: Column[];
  tasks: TodoTask[];
  trash: {
    columns: Column[];
    tasks: TodoTask[];
  };
}
