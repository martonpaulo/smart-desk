export interface TaskFilters {
  title?: string | null;
  important?: boolean | null;
  urgent?: boolean | null;
  blocked?: boolean | null;
  plannedDate?: Date | null;
  done?: boolean | null;
  daily?: boolean | null;
  trashed?: boolean | null;
  tagId?: string | null;
}
