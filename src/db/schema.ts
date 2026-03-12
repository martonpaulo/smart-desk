import { column,Schema, Table } from '@powersync/web';

export const appSchema = new Schema({
  tasks: new Table({
    title: column.text,
    completed: column.integer,
    createdAt: column.text,
    updatedAt: column.text,
  }),
});
