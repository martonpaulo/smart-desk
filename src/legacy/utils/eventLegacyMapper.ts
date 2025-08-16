import { Event } from '@/features/event/types/Event';
import { Event as LegacyEvent } from '@/legacy/types/Event';

export function mapToLegacyEvent(event: Event): LegacyEvent {
  return {
    id: event.id,
    start: event.startTime,
    end: event.endTime,
    title: event.summary,
    allDay: event.allDay,
    description: event.description,
    acknowledged: event.acknowledged,
    trashed: event.trashed,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
    source: 'local',
  };
}

export function mapFromLegacyEvent(legacy: LegacyEvent): Event {
  return {
    id: legacy.id,
    startTime: legacy.start,
    endTime: legacy.end,
    summary: legacy.title,
    description: legacy.description,
    allDay: legacy.allDay ?? false,
    acknowledged: legacy.acknowledged ?? false,
    trashed: legacy.trashed ?? false,
    createdAt: legacy.createdAt ?? new Date(),
    updatedAt: legacy.updatedAt ?? new Date(),
    isSynced: true, // Default or override this if needed
  };
}
