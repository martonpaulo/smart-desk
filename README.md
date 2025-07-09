# Smart Desk

Smart Desk is a small dashboard built with Next.js and Material UI. It aggregates events from Google Calendar and custom ICS feeds and also lets you manage personal tasks and reminders.

## Features

- Google authentication in a dedicated tab
- Merge Google and ICS calendar events
- Manage personal tasks with drag and drop columns
- Add, edit and remove local events
- Trash bin for tasks, columns and local events with restore option
- Optional audio alerts and time announcements
- **Offline first data sync with Supabase**

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

Local settings are persisted using `localStorage`. To reset all data simply clear the browser storage.

### Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Google OAuth callback URLs

Add the following authorized redirect URIs in the Google console so both
NextAuth and Supabase can complete the OAuth flow:

```
http://localhost:3000/api/auth/callback/google
http://localhost:3000
https://your-production-domain/api/auth/callback/google
https://your-production-domain
```

Ensure the Supabase project `Site URL` matches the domain you deploy to.

## Database setup on Supabase

Create `tasks` and `events` tables with row level security enabled and policies based on the `user_id` column. The columns used in the hooks are:

### `tasks`
- `id` uuid primary key
- `user_id` uuid reference to auth.users
- `title` text
- `description` text
- `tags` text[]
- `column_id` text
- `quantity` integer
- `quantity_total` integer
- timestamp columns (`created_at`, `updated_at`)

### `events`
- `id` uuid primary key
- `user_id` uuid reference to auth.users
- `start` timestamptz
- `end` timestamptz
- `title` text
- `attendee_count` integer
- `calendar` text
- `aknowledged` boolean
- timestamp columns (`created_at`, `updated_at`)

Enable policies so that each logged in user can only read and write their own rows.

## Tests

No automated tests are provided. Run `npm run lint` to check the code style.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Example usage

```tsx
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useSupabaseTasks';
import { useEvents, useCreateEvent } from '@/hooks/useSupabaseEvents';

function Dashboard() {
  const { data: tasks } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const { data: events } = useEvents();
  const createEvent = useCreateEvent();

  // Example: add a task
  function handleAdd() {
    createTask.mutate({ title: 'My task', tags: [], columnId: 'todo' });
  }

  // Example: mark task done
  function handleDone(id: string) {
    updateTask.mutate({ id, updates: { columnId: 'done' } });
  }

  // Example: delete a task
  function handleDelete(id: string) {
    deleteTask.mutate(id);
  }

  return null;
}
```

The hooks cache data with React Query. When the network is offline the cached data is used automatically and changes are queued until the connection is restored.
