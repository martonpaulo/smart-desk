export interface Note {
  id: string;
  title?: string;
  content: string;
  updatedAt: Date;
  createdAt: Date;
  isSynced?: boolean;
}
