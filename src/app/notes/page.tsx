"use client";

import { useRegisterFeature } from '@/core/store/useActiveFeaturesStore';
import { NotesView } from '@/features/note/views/NotesView';

export default function NotesPage() {
  useRegisterFeature('notes');
  return <NotesView />;
}
