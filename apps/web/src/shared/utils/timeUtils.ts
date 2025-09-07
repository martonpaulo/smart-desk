import { intervalToDuration } from 'date-fns';

/**
 * Format any ms duration as "1y 2mo 3d 4h 5m 6s"
 * skips zero‑value units
 */
export function formatFullDuration(ms: number): string {
  const {
    years = 0,
    months = 0,
    days = 0,
    hours = 0,
    minutes = 0,
    seconds = 0,
  } = intervalToDuration({ start: 0, end: ms });

  const units: [number, string][] = [
    [years, 'y'],
    [months, 'mo'],
    [days, 'd'],
    [hours, 'h'],
    [minutes, 'm'],
    [seconds, 's'],
  ];

  const result = units
    .filter(([v]) => v > 0)
    .map(([v, label]) => `${v}${label}`)
    .join(' ');

  return result || '0s';
}
