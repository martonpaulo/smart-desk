export function shouldRetry(
  failureCount: number,
  error: unknown,
  maxRetryAttempts: number,
): boolean {
  const message = (error as Error)?.message || '';
  const authError = 'Authentication required';
  const apiError = 'API route not found';

  const isAuthOrApiError = new RegExp(`${authError}|${apiError}`).test(message);
  return !isAuthOrApiError && failureCount < maxRetryAttempts;
}

export function calculateRetryDelay(attempt: number, maxRetryDelayMs: number): number {
  return Math.min(1000 * 2 ** attempt, maxRetryDelayMs);
}
