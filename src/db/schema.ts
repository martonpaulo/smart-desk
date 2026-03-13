import { column, Schema, Table } from '@powersync/web';

export const appSchema = new Schema({
  google_connections: new Table({
    user_id: column.text,
    provider_account_id: column.text,
    refresh_token_encrypted: column.text,
    sync_token: column.text,
    token_expiry: column.text,
    created_at: column.text,
    updated_at: column.text,
  }),
  calendar_events: new Table({
    user_id: column.text,
    google_event_id: column.text,
    calendar_id: column.text,
    title: column.text,
    starts_at: column.text,
    ends_at: column.text,
    all_day: column.integer,
    status: column.text,
    updated_at: column.text,
    deleted_at: column.text,
  }),
});
