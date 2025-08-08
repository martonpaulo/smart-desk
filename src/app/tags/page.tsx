"use client";

import { useRegisterFeature } from '@/core/store/useActiveFeaturesStore';
import { TagsManagerView } from '@/features/tag/views/TagsManagerView';

export default function NotesPage() {
  useRegisterFeature('tags');
  return <TagsManagerView />;
}
