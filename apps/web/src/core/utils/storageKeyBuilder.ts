const STORAGE_NAMESPACE = process.env.NEXT_PUBLIC_STORAGE_PREFIX ?? '';
const STORAGE_VERSION = process.env.NEXT_PUBLIC_STORAGE_VERSION ?? 'v1';

export function buildStorageKey(baseKey: string): string {
  if (!baseKey.trim()) {
    throw new Error('buildStorageKey: baseKey must be a non-empty string');
  }

  const parts = [];

  if (STORAGE_NAMESPACE) {
    parts.push(`@${STORAGE_NAMESPACE}`);
  }

  parts.push(baseKey);
  parts.push(STORAGE_VERSION);

  return parts.join(':');
}
