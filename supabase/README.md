# Supabase Setup

This folder contains SQL scripts to create the tables used by Smart Desk.

## Requirements

Run these scripts in your Supabase project. They will create the `events` and `tasks` tables with row level security enabled.

1. Open the SQL editor in the Supabase dashboard.
2. Execute the scripts in `create_events_table.sql` and `create_tasks_table.sql`.
3. Grant authenticated users access by enabling the included policies.

Both scripts assume the `uuid-ossp` extension is available. If it is not, enable it with:

```sql
create extension if not exists "uuid-ossp";
```
