import { timeLoadState } from '@/shared/constants/timeLoadState';

export function resolveTimeLoadState(totalMinutes: number) {
  const ranges = Object.values(timeLoadState);
  const sorted = ranges.sort((a, b) => a.startTime - b.startTime);

  // Find the last state where totalMinutes >= startTime
  let currentState = sorted[0]; // Default to first state
  for (const state of sorted) {
    if (totalMinutes >= state.startTime) currentState = state;
  }

  return currentState;
}
