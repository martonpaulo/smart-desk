export enum SyncInterval {
  CRITICAL = 10_000, // Real-time or near real-time updates (e.g. auth status, connectivity)
  HIGH = 20_000, // Frequently changing data (e.g. notes, current events)
  MEDIUM = 60_000, // Occasionally changing data (e.g. user settings, preferences)
  LOW = 120_000, // Rarely changing data (e.g. locations, static metadata)
  RARE = 300_000, // Almost static data (e.g. onboarding tips, app info)
  VISIBILITY = 80_000, // When the document becomes visible
  BACKGROUND = 600_000, // Background sync interval, 10 minutes
}
