import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getLanguagePreference,
  upsertLanguagePreference,
} from '@/features/preferences/logic/language-preference';

const { dbMock } = vi.hoisted(() => ({
  dbMock: {
    getAll: vi.fn(),
    execute: vi.fn(),
  },
}));

vi.mock('@/db/powersync', () => ({
  db: dbMock,
}));

describe('language-preference logic', () => {
  beforeEach(() => {
    dbMock.getAll.mockReset();
    dbMock.execute.mockReset();
    dbMock.execute.mockResolvedValue(undefined);
  });

  it('returns default language when no preference exists', async () => {
    dbMock.getAll.mockResolvedValue([]);

    const language = await getLanguagePreference('user-1');

    expect(language).toBe('en');
  });

  it('updates existing preference without using UPSERT', async () => {
    dbMock.getAll.mockResolvedValue([{ id: 'pref-1' }]);

    await upsertLanguagePreference({ userId: 'user-1', language: 'es' });

    expect(dbMock.execute).toHaveBeenCalledTimes(1);
    const [sql] = dbMock.execute.mock.calls[0] as [string, unknown[]];
    expect(sql).toContain('UPDATE preferences');
    expect(sql).not.toContain('ON CONFLICT');
  });

  it('inserts preference when no row exists', async () => {
    dbMock.getAll.mockResolvedValue([]);

    await upsertLanguagePreference({ userId: 'user-1', language: 'es' });

    expect(dbMock.execute).toHaveBeenCalledTimes(1);
    const [sql] = dbMock.execute.mock.calls[0] as [string, unknown[]];
    expect(sql).toContain('INSERT INTO preferences');
    expect(sql).not.toContain('ON CONFLICT');
  });
});
