// Format total minutes as "1h 20min" (or "20min" if less than 1h)
export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hoursPart = hours > 0 ? `${hours}h ` : '';

  let minutesPart = '';
  if (minutes < 10 && hours === 0) {
    minutesPart = `${minutes}min`;
  } else if (minutes !== 0) {
    minutesPart = `${minutes.toString().padStart(2, '0')}min`;
  }

  return `${hoursPart}${minutesPart}`;
}

// Parse a string like "1h 20min", "90min", "2h", or plain "90" into total minutes
// Falls back to 0 if nothing matches
export function parseDuration(input: string): number {
  // try to match hours and minutes
  const hoursMatch = input.match(/(\d+)\s*h/);
  const minutesMatch = input.match(/(\d+)\s*min/);
  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;

  // if no explicit match, try raw number
  if (!hoursMatch && !minutesMatch) {
    const raw = parseInt(input, 10);
    return isNaN(raw) ? 0 : raw;
  }

  return hours * 60 + minutes;
}

// helper to compare two dates by day (ignores time)
export function isSameDay(date: string | Date | undefined, target?: Date): boolean {
  if (!date || !target) return false;
  const d1 = typeof date === 'string' ? new Date(date) : date;
  return d1.toDateString() === target.toDateString();
}

/**
 * Returns a human‑friendly label for a given date
 * @param date the date to format
 * @returns one of:
 *   – "yesterday" | "today" | "tomorrow"
 *   – "this Sunday", "this Monday", … (for 2–6 days ahead)
 *   – "last Sunday", "last Monday", … (for 2–6 days before)
 *   – "Wed, 03 Apr" (same year, outside ±6 days)
 *   – "Wed, 03 Apr 2026" (other years)
 *   – "No Date" (if input is null/undefined/invalid)
 */
export function getDateLabel(date: Date | null | undefined | string): string {
  // invalid or missing date
  if (!date) return 'No Date';
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return 'No Date';

  // normalize to midnight for accurate day difference
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(parsed);
  target.setHours(0, 0, 0, 0);

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffDays = Math.round((target.getTime() - today.getTime()) / msPerDay);

  // simple relative days
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  if (diffDays === -1) return 'yesterday';

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // next 5 days after tomorrow
  if (diffDays >= 2 && diffDays <= 6) {
    return `this ${weekdays[target.getDay()]}`;
  }

  // past 5 days before yesterday
  if (diffDays <= -2 && diffDays >= -6) {
    return `last ${weekdays[target.getDay()]}`;
  }

  // fallback formatting
  const shortWeekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const wd = shortWeekdays[target.getDay()];
  const day = String(target.getDate()).padStart(2, '0');
  const mo = months[target.getMonth()];

  // same calendar year: omit year
  if (target.getFullYear() === today.getFullYear()) {
    return `${wd}, ${day} ${mo}`;
  }

  // different year: include year
  return `${wd}, ${day} ${mo} ${target.getFullYear()}`;
}

export function toLocalDateString(date?: Date) {
  if (!date) return '';
  const datetime = new Date(date);
  const offset = datetime.getTimezoneOffset();
  const localDate = new Date(datetime.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split('T')[0];
}

// return in format 9pm, 10:30am, 3:15pm, 8pm, 3am
export function toLocalTimeString(date?: Date) {
  if (!date) return '';
  const datetime = new Date(date);
  const hours = datetime.getHours();
  const minutes = datetime.getMinutes();
  const meridiem = hours >= 12 ? 'pm' : 'am';
  const formattedHours = hours % 12 || 12; // convert 0 to 12 for 12-hour format
  const formattedMinutes = minutes > 0 ? `:${String(minutes).padStart(2, '0')}` : '';
  return `${formattedHours}${formattedMinutes}${meridiem}`;
}

export function isWeekday(date: Date | null | undefined): boolean {
  if (!date) return false;
  const day = date.getDay();
  return day !== 0 && day !== 6; // exclude Sunday (0) and Saturday (6)
}

export function isPast(date: Date | null | undefined): boolean {
  if (!date) return false;
  const now = new Date();
  const datetime = new Date(date);
  return datetime.getTime() < now.getTime();
}

export const weekDays = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
