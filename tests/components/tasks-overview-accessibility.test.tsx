import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TasksOverview } from '@/features/tasks/components/tasks-overview';
import type { Task } from '@/features/tasks/types/task';

const useAuthUserIdMock = vi.fn();
const useTasksMock = vi.fn();
const useCreateTaskMock = vi.fn();
const useUpdateTaskMock = vi.fn();
const useDeleteTaskMock = vi.fn();

const taskFixture: Task = {
  id: 'task-1',
  title: 'Write changelog',
  description: 'Document release changes',
  tags: ['work'],
  plannedDate: '2026-03-14',
  updatedAt: '2026-03-14T12:00:00.000Z',
};

const translations: Record<string, string> = {
  'tasks.title': 'Tasks',
  'tasks.subtitle': 'Task subtitle',
  'tasks.actions.edit': 'Edit',
  'tasks.actions.delete': 'Delete',
  'tasks.defaultTaskTitle': 'New Task',
  'tasks.emptyState': 'No tasks',
  'tasks.loading': 'Loading',
  'tasks.signInHint': 'Sign in hint',
  'tasks.editDialog.title': 'Edit task',
  'tasks.editDialog.description': 'Edit description',
  'tasks.form.addTask': 'Add task',
  'tasks.editDialog.saveChanges': 'Save changes',
  'tasks.editDialog.cancel': 'Cancel',
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => translations[key] ?? key,
    i18n: { resolvedLanguage: 'en' },
  }),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: ReactNode }) => <section>{children}</section>,
  CardHeader: ({ children }: { children: ReactNode }) => <header>{children}</header>,
  CardContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: ReactNode }) => <h3>{children}</h3>,
  DialogDescription: ({ children }: { children: ReactNode }) => <p>{children}</p>,
}));

vi.mock('@/features/tasks/components/task-form', () => ({
  TaskForm: () => <form aria-label="task-form" />,
}));

vi.mock('@/features/tasks/hooks/use-auth-user-id', () => ({
  useAuthUserId: () => useAuthUserIdMock(),
}));

vi.mock('@/features/tasks/hooks/use-tasks', () => ({
  useTasks: () => useTasksMock(),
  useCreateTask: (...args: unknown[]) => useCreateTaskMock(...args),
  useUpdateTask: (...args: unknown[]) => useUpdateTaskMock(...args),
  useDeleteTask: (...args: unknown[]) => useDeleteTaskMock(...args),
}));

describe('TasksOverview accessibility', () => {
  beforeEach(() => {
    useAuthUserIdMock.mockReturnValue({ userId: 'user-1', isLoading: false });
    useTasksMock.mockReturnValue({ data: [taskFixture], isLoading: false });
    useCreateTaskMock.mockReturnValue({ isPending: false, mutateAsync: vi.fn() });
    useUpdateTaskMock.mockReturnValue({ isPending: false, mutateAsync: vi.fn() });
    useDeleteTaskMock.mockReturnValue({ isPending: false, mutateAsync: vi.fn() });
  });

  it('renders task action buttons as non-submit buttons with decorative icons hidden', () => {
    render(<TasksOverview />);

    const editButton = screen.getByRole('button', { name: 'Edit' });
    const deleteButton = screen.getByRole('button', { name: 'Delete' });

    expect(editButton).toHaveAttribute('type', 'button');
    expect(deleteButton).toHaveAttribute('type', 'button');

    const editIcon = editButton.querySelector('svg');
    const deleteIcon = deleteButton.querySelector('svg');

    expect(editIcon).toHaveAttribute('aria-hidden', 'true');
    expect(deleteIcon).toHaveAttribute('aria-hidden', 'true');
  });
});
