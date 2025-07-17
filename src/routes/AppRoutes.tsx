'use client';

import { Route, Routes } from 'react-router-dom';

import { NavigationLayout } from '@/navigation/NavigationLayout';
import { AllTasksPage } from '@/pages/AllTasksPage';
import { DraftsPage } from '@/pages/DraftsPage';
import { EisenhowerMatrixPage } from '@/pages/EisenhowerMatrixPage';
import { HomePage } from '@/pages/HomePage';
import { TrashPage } from '@/pages/TrashPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<NavigationLayout />}>
        <Route index element={<HomePage />} />
        <Route path="tasks" element={<AllTasksPage />} />
        <Route path="matrix" element={<EisenhowerMatrixPage />} />
        <Route path="drafts" element={<DraftsPage />} />
        <Route path="trash" element={<TrashPage />} />
      </Route>
    </Routes>
  );
}
