export function parseDateFromSlug(slug?: string[]): Date {
  const now = new Date();

  if (!slug || slug.length === 0) return now;

  const [yearStr, monthStr, dayStr] = slug;
  const year = Number(yearStr);
  const month = monthStr ? Number(monthStr) : NaN;
  const day = dayStr ? Number(dayStr) : NaN;

  if (isNaN(year)) return now;
  if (!isNaN(day) && !isNaN(month)) return new Date(year, month - 1, day);
  if (!isNaN(month)) return new Date(year, month - 1, 1);
  return new Date(year, 0, 1);
}
