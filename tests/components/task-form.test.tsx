import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TaskForm } from '@/features/tasks/components/task-form';
import type { TaskFormValues } from '@/features/tasks/logic/task-form-schema';

const translations: Record<string, string> = {
  'tasks.form.titleLabel': 'Title',
  'tasks.form.titlePlaceholder': 'Write release notes',
  'tasks.form.descriptionLabel': 'Description (optional)',
  'tasks.form.descriptionPlaceholder': 'Add context',
  'tasks.form.tagsLabel': 'Tags (optional)',
  'tasks.form.tagsPlaceholder': 'work, urgent',
  'tasks.form.plannedDateLabel': 'Planned date',
  'tasks.form.validation.titleRequired': 'Title is required.',
  'tasks.form.validation.titleMax': 'Title max',
  'tasks.form.validation.descriptionMax': 'Description max',
  'tasks.form.validation.tagsMax': 'Tags max',
  'tasks.form.validation.plannedDateFormat': 'Date format',
  'tasks.editDialog.cancel': 'Cancel',
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => translations[key] ?? key,
  }),
}));

function createDefaultValues(): TaskFormValues {
  return {
    title: '',
    description: '',
    tagsInput: '',
    plannedDate: '2026-03-14',
  };
}

describe('TaskForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('keeps typed title across rerenders with equivalent default values and submits it', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async () => undefined);

    const { rerender } = render(
      <TaskForm
        defaultValues={createDefaultValues()}
        isSubmitting={false}
        submitLabel="Add task"
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText('Title'), 'Plan roadmap');

    rerender(
      <TaskForm
        defaultValues={createDefaultValues()}
        isSubmitting={false}
        submitLabel="Add task"
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Add task' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Plan roadmap',
        }),
      );
    });

    expect(screen.queryByText('Title is required.')).not.toBeInTheDocument();
  });

  it('exposes validation state and error association for accessibility', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async () => undefined);

    render(
      <TaskForm
        defaultValues={createDefaultValues()}
        isSubmitting={false}
        submitLabel="Add task"
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Add task' }));

    const titleInput = screen.getByLabelText('Title');
    const titleError = await screen.findByRole('alert');

    expect(titleInput).toHaveAttribute('aria-invalid', 'true');
    expect(titleInput).toHaveAttribute('aria-describedby', 'task-title-error');
    expect(titleError).toHaveAttribute('id', 'task-title-error');
    expect(titleError).toHaveTextContent('Title is required.');
  });
});
