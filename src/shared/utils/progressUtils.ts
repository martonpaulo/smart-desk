import { progressState } from '@/shared/constants/progressState';

export function resolveProgressState(percent: number) {
  const ranges = Object.values(progressState);
  const sorted = ranges.sort((a, b) => a.startPercent - b.startPercent);

  // Pick the last range whose startPercent <= percent
  let currentState = sorted[0];
  for (const state of sorted) {
    if (percent >= state.startPercent) currentState = state;
    else break;
  }

  return currentState;
}
