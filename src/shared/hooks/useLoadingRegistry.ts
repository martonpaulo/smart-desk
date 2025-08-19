import { useRef, useState } from 'react';

export function useLoadingRegistry() {
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const fallbackRef = useRef<string>('__default');

  const add = (key?: string) => {
    const k = key ?? fallbackRef.current;
    setKeys(prev => {
      const next = new Set(prev);
      next.add(k);
      return next;
    });
  };

  const remove = (key?: string) => {
    const k = key ?? fallbackRef.current;
    setKeys(prev => {
      const next = new Set(prev);
      next.delete(k);
      return next;
    });
  };

  const isLoading = (key?: string) => {
    const k = key ?? fallbackRef.current;
    return keys.has(k);
  };

  return { add, remove, isLoading };
}
