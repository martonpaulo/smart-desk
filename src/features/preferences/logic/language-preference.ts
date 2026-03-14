import { db } from '@/db/powersync';
import {
  DEFAULT_LANGUAGE,
  type SupportedLanguage,
  toSupportedLanguage,
} from '@/features/i18n/constants/languages';
import { PREFERENCES_TABLE } from '@/features/preferences/constants/preferences';

interface LanguagePreferenceRow {
  language: string;
}

interface UpsertLanguagePreferencePayload {
  userId: string;
  language: SupportedLanguage;
}

export async function getLanguagePreference(userId: string): Promise<SupportedLanguage> {
  const rows = await db.getAll<LanguagePreferenceRow>(
    `
      SELECT language
      FROM ${PREFERENCES_TABLE}
      WHERE user_id = ?
      LIMIT 1
    `,
    [userId],
  );

  const [row] = rows;
  if (!row) {
    return DEFAULT_LANGUAGE;
  }

  return toSupportedLanguage(row.language);
}

export async function upsertLanguagePreference(
  payload: UpsertLanguagePreferencePayload,
): Promise<void> {
  const nowIso = new Date().toISOString();

  await db.execute(
    `
      INSERT INTO ${PREFERENCES_TABLE} (
        id,
        user_id,
        language,
        updated_at
      )
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id)
      DO UPDATE SET
        language = excluded.language,
        updated_at = excluded.updated_at
    `,
    [crypto.randomUUID(), payload.userId, payload.language, nowIso],
  );
}
