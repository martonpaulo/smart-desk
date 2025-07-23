export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function weekRange(date: Date): { start: Date; end: Date } {
  const start = startOfDay(new Date(date));
  start.setDate(start.getDate() - start.getDay());
  const end = endOfDay(new Date(start));
  end.setDate(start.getDate() + 6);
  return { start, end };
}

export function monthRange(date: Date): { start: Date; end: Date } {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = startOfDay(first);
  start.setDate(start.getDate() - start.getDay());
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const end = endOfDay(last);
  end.setDate(end.getDate() + (6 - end.getDay()));
  return { start, end };
}
