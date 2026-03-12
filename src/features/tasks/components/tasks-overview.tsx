'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTasks } from '@/features/tasks/hooks/use-tasks';

export function TasksOverview() {
  const { data: tasks = [] } = useTasks();

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Smart Desk</h1>
        <p className="text-muted-foreground">
          Tasks read from the local database layer. Remote sync is handled in the background.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <p className="text-muted-foreground">
                No tasks yet. Local task schema wiring is next.
              </p>
            ) : (
              <ul className="space-y-2">
                {tasks.map(task => (
                  <li key={task.id} className="rounded-md border p-3">
                    {task.title}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
