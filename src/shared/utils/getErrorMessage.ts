/**
 * Extracts a readable message from an unknown error.
 * Handles native Error, Axios errors, API responses, and unexpected values.
 */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  // Native JS Error
  if (error instanceof Error) {
    return error.message;
  }

  // Axios or API error structure (error.response.data.message)
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response &&
    typeof error.response.data === 'object' &&
    error.response.data !== null
  ) {
    const data = error.response.data as Record<string, unknown>;

    if (typeof data.message === 'string') {
      return data.message;
    }

    // e.g. Next.js API error format
    if (typeof data.error === 'string') {
      return data.error;
    }
  }

  // Fallback if string or unknown object
  if (typeof error === 'string') return error;

  // Unexpected shape
  return fallback;
}
