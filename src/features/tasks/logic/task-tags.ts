const TAG_INPUT_SEPARATOR = ',';

function normalizeTaskTagValue(tagValue: string): string {
  return tagValue.trim();
}

function normalizeTaskTags(tagValues: string[]): string[] {
  const uniqueTagValues = new Set<string>();

  for (const tagValue of tagValues) {
    const normalizedTag = normalizeTaskTagValue(tagValue);
    if (normalizedTag.length > 0) {
      uniqueTagValues.add(normalizedTag);
    }
  }

  return Array.from(uniqueTagValues);
}

export function parseTaskTagsInput(tagsInput: string | undefined): string[] | null {
  if (!tagsInput) {
    return null;
  }

  const normalizedTags = normalizeTaskTags(tagsInput.split(TAG_INPUT_SEPARATOR));
  return normalizedTags.length > 0 ? normalizedTags : null;
}

export function formatTaskTagsInput(tags: string[] | null): string {
  if (!tags || tags.length === 0) {
    return '';
  }

  return tags.join(', ');
}

export function serializeTaskTags(tags: string[] | null): string | null {
  if (!tags || tags.length === 0) {
    return null;
  }

  return JSON.stringify(normalizeTaskTags(tags));
}

export function parseStoredTaskTags(storedTags: string | null): string[] | null {
  if (!storedTags) {
    return null;
  }

  const trimmedStoredTags = storedTags.trim();
  if (trimmedStoredTags.length === 0) {
    return null;
  }

  try {
    const parsedTags = JSON.parse(trimmedStoredTags) as unknown;
    if (Array.isArray(parsedTags)) {
      const stringTags = parsedTags.filter((tag): tag is string => typeof tag === 'string');
      const normalizedTags = normalizeTaskTags(stringTags);
      return normalizedTags.length > 0 ? normalizedTags : null;
    }
  } catch {
    // Legacy non-JSON value; fall back to comma-separated parsing.
  }

  const normalizedTags = normalizeTaskTags(trimmedStoredTags.split(TAG_INPUT_SEPARATOR));
  return normalizedTags.length > 0 ? normalizedTags : null;
}
