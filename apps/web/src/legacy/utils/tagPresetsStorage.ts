import { getStoredFilters, setStoredFilters } from 'src/legacy/utils/localStorageUtils';

export interface TagPreset {
  name: string;
  color: string;
}

const KEY = 'tag-presets';

export function loadTagPresets(): TagPreset[] {
  return getStoredFilters<TagPreset[]>(KEY) ?? [];
}

export function saveTagPresets(presets: TagPreset[]): void {
  setStoredFilters(KEY, presets);
}
