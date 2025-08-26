-- Generic purge with two rules:
--  A) deleted_at <= now() - retention_days
--  B) trashed = true AND updated_at <= now() - retention_days
-- Retention source:
--  - If table has user_id: per-row retention from user_settings. Missing or invalid values are normalized to 30.
--  - If table has no user_id: use 30.
-- Discovery is dynamic. If the table has neither deleted_at nor trashed, nothing happens.

create
or replace function public.purge_soft_deleted_v3(p_schema text, p_table text) returns integer language plpgsql security definer
set
	search_path = public,
	pg_temp as $$ declare has_table boolean;

has_user_id boolean;

has_deleted boolean;

has_trashed boolean;

has_updated boolean;

deleted_count integer;

cond_a text;

cond_b text;

retention_expr text;

begin -- Validate table existence
select
	exists (
		select
			1
		from
			information_schema.tables
		where
			table_schema = p_schema
			and table_name = p_table
			and table_type = 'BASE TABLE'
	) into has_table;

if not has_table then raise exception 'Table %.% does not exist',
p_schema,
p_table;

end if;

-- Detect relevant columns
select
	exists (
		select
			1
		from
			information_schema.columns
		where
			table_schema = p_schema
			and table_name = p_table
			and column_name = 'user_id'
	),
	exists (
		select
			1
		from
			information_schema.columns
		where
			table_schema = p_schema
			and table_name = p_table
			and column_name = 'deleted_at'
	),
	exists (
		select
			1
		from
			information_schema.columns
		where
			table_schema = p_schema
			and table_name = p_table
			and column_name = 'trashed'
	),
	exists (
		select
			1
		from
			information_schema.columns
		where
			table_schema = p_schema
			and table_name = p_table
			and column_name = 'updated_at'
	) into has_user_id,
	has_deleted,
	has_trashed,
	has_updated;

if not has_deleted
and not has_trashed then return 0;

end if;

-- Ensure user_settings rows exist and are valid when table has user_id
if has_user_id then -- Insert missing settings with default 30
execute format(
	'insert into public.user_settings (user_id, retention_days)
       select distinct t.user_id, 30
       from %I.%I t
       left join public.user_settings s on s.user_id = t.user_id
       where t.user_id is not null and s.user_id is null',
	p_schema,
	p_table
);

-- Normalize invalid or null values to 30
perform 1
from
	public.user_settings
where
	retention_days not in (7, 30, 90)
	or retention_days is null;

if found then
update
	public.user_settings
set
	retention_days = 30
where
	retention_days not in (7, 30, 90)
	or retention_days is null;

end if;

-- Per-row retention expression
retention_expr := format(
	'coalesce((select s.retention_days from public.user_settings s where s.user_id = %I.user_id), 30)',
	p_table
);

else -- No user_id on table, default is 30
retention_expr := '30';

end if;

-- Build conditions
if has_deleted then cond_a := format(
	'%I.deleted_at is not null and %I.deleted_at <= (now() - ( %s || '' days'' )::interval)',
	p_table,
	p_table,
	retention_expr
);

else cond_a := 'false';

end if;

if has_trashed
and has_updated then cond_b := format(
	'%I.trashed = true and %I.updated_at <= (now() - ( %s || '' days'' )::interval)',
	p_table,
	p_table,
	retention_expr
);

else cond_b := 'false';

end if;

-- Batch delete using ctid
execute format(
	'with to_del as (
       select ctid
       from %I.%I
       where (%s) or (%s)
     )
     delete from %I.%I t
     using to_del d
     where t.ctid = d.ctid
     returning 1',
	p_schema,
	p_table,
	cond_a,
	cond_b,
	p_schema,
	p_table
) into deleted_count;

return coalesce(deleted_count, 0);

end;

$$;

revoke all on function public.purge_soft_deleted_v3(text, text)
from
	public;

grant execute on function public.purge_soft_deleted_v3(text, text) to authenticated,
service_role;
