'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type AlignUnit = 'none' | 'second' | 'minute' | 'hour';

type UseCurrentTimeOptions = {
  intervalMs?: number;
  alignTo?: AlignUnit;
  isPaused?: boolean;
};

const MIN_INTERVAL_MS = 250;
const MAX_INTERVAL_MS = 24 * 60 * 60 * 1000;

export function useCurrentTime({
  intervalMs = 60_000,
  alignTo = 'minute',
  isPaused = false,
}: UseCurrentTimeOptions = {}) {
  // Clamp interval to avoid zero or extreme values
  const safeInterval = Number.isFinite(intervalMs)
    ? Math.min(Math.max(Math.floor(intervalMs), MIN_INTERVAL_MS), MAX_INTERVAL_MS)
    : 60_000;

  const [now, setNow] = useState<Date>(() => new Date());
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Compute milliseconds until the next boundary based on the requested alignment
  const msUntilNextAlignedBoundary = useCallback(
    (date: Date, unit: AlignUnit): number => {
      if (unit === 'none') return safeInterval;

      if (unit === 'second') {
        const ms = date.getMilliseconds();
        return 1000 - ms;
      }

      if (unit === 'minute') {
        const s = date.getSeconds();
        const ms = date.getMilliseconds();
        return (60 - s) * 1000 - ms;
      }

      // unit === 'hour'
      const m = date.getMinutes();
      const s = date.getSeconds();
      const ms = date.getMilliseconds();
      return (60 - m) * 60_000 - s * 1000 - ms;
    },
    [safeInterval],
  );

  const tick = useCallback(() => {
    const next = new Date();
    setNow(next);

    // Schedule the next tick strictly after safeInterval to minimize drift accumulation
    timerRef.current = window.setTimeout(tick, safeInterval);
  }, [safeInterval]);

  // When alignment is 'none', you might still want the first tick to occur exactly after `safeInterval`
  // When alignment is not 'none', we align the first tick to the boundary, then follow `safeInterval` ticks
  const scheduleNext = useCallback(
    (delay: number) => {
      timerRef.current = window.setTimeout(() => {
        const next = new Date();
        setNow(next);

        // After the first aligned tick, continue using the fixed interval
        timerRef.current = window.setTimeout(tick, safeInterval);
      }, delay);
    },
    [safeInterval, tick],
  );

  useEffect(() => {
    if (isPaused) return;

    // Initialize immediately so UI reads a fresh timestamp
    setNow(new Date());

    // First delay depends on alignment setting
    const firstDelay =
      alignTo === 'none' ? safeInterval : msUntilNextAlignedBoundary(new Date(), alignTo);

    scheduleNext(firstDelay);

    // Re-sync when tab becomes visible
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        clearTimer();
        setNow(new Date());
        const delay =
          alignTo === 'none' ? safeInterval : msUntilNextAlignedBoundary(new Date(), alignTo);
        scheduleNext(delay);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearTimer();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [safeInterval, alignTo, isPaused, msUntilNextAlignedBoundary, scheduleNext]);

  return now;
}
