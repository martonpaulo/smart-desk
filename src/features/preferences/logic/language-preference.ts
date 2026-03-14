import { db } from '@/db/powersync';
import {
  DEFAULT_LANGUAGE,
  type SupportedLanguage,
  toSupportedLanguage,
} from '@/features/i18n/constants/languages';
import { PREFERENCES_TABLE } from '@/features/preferences/constants/preferences';

interface LanguagePreferenceRow {
  id: string;
  language: string;
}

interface UpsertLanguagePreferencePayload {
  userId: string;
  language: SupportedLanguage;
}

export async function getLanguagePreference(userId: string): Promise<SupportedLanguage> {
  const rows = await db.getAll<LanguagePreferenceRow>(
    `
      SELECT id, language
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
  const rows = await db.getAll<Pick<LanguagePreferenceRow, 'id'>>(
    `
      SELECT id
      FROM ${PREFERENCES_TABLE}
      WHERE user_id = ?
      LIMIT 1
    `,
    [payload.userId],
  );

  const [existingPreference] = rows;

  if (existingPreference) {
    await db.execute(
      `
        UPDATE ${PREFERENCES_TABLE}
        SET
          language = ?,
          updated_at = ?
        WHERE id = ?
      `,
      [payload.language, nowIso, existingPreference.id],
    );

    return;
  }

  await db.execute(
    `
      INSERT INTO ${PREFERENCES_TABLE} (
        id,
        user_id,
        language,
        updated_at
      )
      VALUES (?, ?, ?, ?)
    `,
    [crypto.randomUUID(), payload.userId, payload.language, nowIso],
  );
}
