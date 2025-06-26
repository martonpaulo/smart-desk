const STORAGE_PREFIX = process.env.NEXT_PUBLIC_STORAGE_PREFIX ?? '';
const STORAGE_VERSION = process.env.NEXT_PUBLIC_STORAGE_VERSION ?? 'unknown-version';

export function buildStorageKey(key: string): string {
  return STORAGE_PREFIX
    ? `@${STORAGE_PREFIX}:${key}:${STORAGE_VERSION}`
    : `${key}:${STORAGE_VERSION}`;
}

export function getStoredFilters<T = unknown>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  const data = localStorage.getItem(buildStorageKey(key));
  return data ? (JSON.parse(data) as T) : null;
}

export function setStoredFilters(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(buildStorageKey(key), JSON.stringify(value));
}
