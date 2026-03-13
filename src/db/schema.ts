import { column, Schema, Table } from '@powersync/web';

export const appSchema = new Schema({
  events: new Table({
    title: column.text,
    startsAt: column.text,
    endsAt: column.text,
    allDay: column.integer,
    calendarId: column.text,
    source: column.text,
    createdAt: column.text,
    updatedAt: column.text,
  }),
  tasks: new Table({
    title: column.text,
    completed: column.integer,
    createdAt: column.text,
    updatedAt: column.text,
  }),
});
