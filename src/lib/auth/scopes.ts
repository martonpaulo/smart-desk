/** Required OAuth scopes for Google Calendar access. */
export const REQUIRED_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/calendar.readonly',
];

/**
 * Validate that all required scopes were granted.
 * @param grantedScope scope string returned by Google OAuth
 */
export function validateScopes(grantedScope?: string): boolean {
  if (!grantedScope) return false;
  const granted = grantedScope.split(' ');
  return REQUIRED_SCOPES.every(scope => granted.includes(scope));
}
