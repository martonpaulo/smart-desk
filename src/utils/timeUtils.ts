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
