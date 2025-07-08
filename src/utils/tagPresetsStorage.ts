import { auth } from '@/services/firebase';
import { saveTagPresetsToFirestore } from '@/services/firestore/tagPresets';
import { getStoredFilters, setStoredFilters } from '@/utils/localStorageUtils';

export interface TagPreset {
  name: string;
  color: string;
}

export const TAG_PRESETS_KEY = 'tag-presets';

export function loadTagPresets(): TagPreset[] {
  return getStoredFilters<TagPreset[]>(TAG_PRESETS_KEY) ?? [];
}

export function saveTagPresets(presets: TagPreset[]): void {
  const uid = auth.currentUser?.uid;
  if (uid) {
    saveTagPresetsToFirestore(uid, presets).catch(err =>
      console.error('Failed to save tag presets to Firestore', err),
    );
  }

  setStoredFilters(TAG_PRESETS_KEY, presets);
}
