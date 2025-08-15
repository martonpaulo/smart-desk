export interface TaskFilters {
  title?: string | null;
  important?: boolean | null;
  urgent?: boolean | null;
  blocked?: boolean | null;
  plannedDate?: Date | null;
  plannedFrom?: Date | null;
  plannedTo?: Date | null;
  plannedMode?: 'include' | 'exclude' | 'only' | null;
  classified?: boolean | null;
  done?: boolean | null;
  daily?: boolean | null;
  trashed?: boolean | null;
  tagId?: string | null;
}
