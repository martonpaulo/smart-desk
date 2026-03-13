export interface Task {
  id: string;
  title: string;
  description: string | null;
  tags: string[] | null;
  plannedDate: string;
  updatedAt: string;
}
