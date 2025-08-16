import { addDays, isBefore, set, subDays } from 'date-fns';

const RESET_HOUR = 4;
const RESET_MINUTE = 0;

const now = new Date();

// Today at the reset time (hh:mm:00.000)
const todayAtReset = set(now, {
  hours: RESET_HOUR,
  minutes: RESET_MINUTE,
  seconds: 0,
  milliseconds: 0,
});

// Last reset is today at reset time, unless we're before it, then it's yesterday at reset time
const lastReset = isBefore(now, todayAtReset)
  ? set(subDays(now, 1), {
      hours: RESET_HOUR,
      minutes: RESET_MINUTE,
      seconds: 0,
      milliseconds: 0,
    })
  : todayAtReset;

const nextReset = set(addDays(lastReset, 1), {
  hours: RESET_HOUR,
  minutes: RESET_MINUTE,
  seconds: 0,
  milliseconds: 0,
});

export const RESET_TIME = {
  toString: () =>
    `${RESET_HOUR.toString().padStart(2, '0')}:${RESET_MINUTE.toString().padStart(2, '0')}`,
  resetHour: RESET_HOUR,
  resetMinute: RESET_MINUTE,
  last: lastReset,
  next: nextReset,
};
