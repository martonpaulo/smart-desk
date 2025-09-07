import { useEffect, useState } from 'react';

// returns a constant negative offset so multiple spinners stay in sync
export function useAnimationDelay(cycleMs = 1000): string {
  const [delay, setDelay] = useState('0s');
  useEffect(() => {
    const now = Date.now();
    setDelay(`-${now % cycleMs}ms`);
  }, [cycleMs]);
  return delay;
}
