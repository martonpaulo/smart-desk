import { timeLoad } from '@/config/timeLoad';

export function getTimeLoadState(totalMinutes: number) {
  const timeLoadArray = Object.values(timeLoad);
  // Sort by startTime in ascending order
  timeLoadArray.sort((a, b) => a.startTime - b.startTime);

  // Find the last state where totalMinutes >= startTime
  let currentState = timeLoadArray[0]; // Default to first state
  for (const state of timeLoadArray) {
    if (totalMinutes >= state.startTime) {
      currentState = state;
    }
  }

  return currentState;
}
