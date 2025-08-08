// Enum to define common sync intervals (in milliseconds) for different data types.
// Useful for centralizing and managing realistic sync times in a personal-use app.

export enum SyncInterval {
  CRITICAL = 10_000, // Real-time or near real-time updates (e.g. auth status, connectivity)
  HIGH = 20_000, // Frequently changing data (e.g. notes, current events)
  MEDIUM = 60_000, // Occasionally changing data (e.g. user settings, preferences)
  LOW = 120_000, // Rarely changing data (e.g. locations, static metadata)
  RARE = 300_000, // Almost static data (e.g. onboarding tips, app info)
}

// Global sync configuration values. Centralize all interval numbers here.
export const SyncConfig = {
  BACKGROUND_MINUTES: 10,
} as const;
