import { Event } from '@/types/Event';
import { formattedTime } from '@/utils/eventUtils';

// Compare two lists of events and return human-readable change messages
export function getEventChangeMessages(previousEvents: Event[], currentEvents: Event[]): string[] {
  const prevMap = new Map(previousEvents.map(evt => [evt.id, evt]));
  const currMap = new Map(currentEvents.map(evt => [evt.id, evt]));
  const messages: string[] = [];

  // new or updated events
  for (const event of currentEvents) {
    const prev = prevMap.get(event.id);

    if (!prev) {
      messages.push(
        `Event <b>${event.title}</b> was added at <b>${formattedTime(event.start)}</b>`,
      );
      continue;
    }

    const prevStartObj = new Date(prev.start);
    const prevEndObj = new Date(prev.end);
    const eventStartObj = new Date(event.start);
    const eventEndObj = new Date(event.end);

    const startChanged = prevStartObj.getTime() !== eventStartObj.getTime();
    const endChanged = prevEndObj.getTime() !== eventEndObj.getTime();

    if (startChanged && endChanged) {
      messages.push(
        `Event <b>${event.title}</b> time changed from ` +
          `<b>${formattedTime(prev.start)} - ${formattedTime(prev.end)}</b> to ` +
          `<b>${formattedTime(event.start)} - ${formattedTime(event.end)}</b>`,
      );
    } else if (startChanged) {
      messages.push(
        `Event <b>${event.title}</b> start changed from ` +
          `<b>${formattedTime(prev.start)}</b> to <b>${formattedTime(event.start)}</b>`,
      );
    } else if (endChanged) {
      messages.push(
        `Event <b>${event.title}</b> end changed from ` +
          `<b>${formattedTime(prev.end)}</b> to <b>${formattedTime(event.end)}</b>`,
      );
    }
  }

  // removed events
  for (const event of previousEvents) {
    if (!currMap.has(event.id)) {
      messages.push(
        `Event <b>${event.title}</b> was <b>removed</b> at ${formattedTime(event.start)}`,
      );
    }
  }

  return messages;
}
