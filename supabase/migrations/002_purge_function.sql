CREATE
OR REPLACE FUNCTION public.purge_soft_deleted(p_schema text, p_table text) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER
SET
	search_path = public,
	pg_temp AS $$ DECLARE has_table boolean;

has_user_id boolean;

has_deleted boolean;

has_trashed boolean;

has_updated boolean;

deleted_count integer;

cond_a text;

cond_b text;

retention_expr text;

BEGIN -- 1) validate table existence
SELECT
	EXISTS (
		SELECT
			1
		FROM
			information_schema.tables
		WHERE
			table_schema = p_schema
			AND table_name = p_table
			AND table_type = 'BASE TABLE'
	) INTO has_table;

IF NOT has_table THEN RAISE EXCEPTION 'Table %.% does not exist',
p_schema,
p_table;

END IF;

-- 2) check columns present
SELECT
	EXISTS (
		SELECT
			1
		FROM
			information_schema.columns
		WHERE
			table_schema = p_schema
			AND table_name = p_table
			AND column_name = 'user_id'
	),
	EXISTS (
		SELECT
			1
		FROM
			information_schema.columns
		WHERE
			table_schema = p_schema
			AND table_name = p_table
			AND column_name = 'deleted_at'
	),
	EXISTS (
		SELECT
			1
		FROM
			information_schema.columns
		WHERE
			table_schema = p_schema
			AND table_name = p_table
			AND column_name = 'trashed'
	),
	EXISTS (
		SELECT
			1
		FROM
			information_schema.columns
		WHERE
			table_schema = p_schema
			AND table_name = p_table
			AND column_name = 'updated_at'
	) INTO has_user_id,
	has_deleted,
	has_trashed,
	has_updated;

IF NOT has_deleted
AND NOT has_trashed THEN RETURN 0;

-- nothing to do
END IF;

-- 3) ensure user_settings defaults when table has user_id
IF has_user_id THEN -- Insert missing rows with default 30
EXECUTE format(
	'INSERT INTO public.user_settings (user_id, retention_days)
       SELECT DISTINCT t.user_id, 30
       FROM %I.%I t
       LEFT JOIN public.user_settings s ON s.user_id = t.user_id
       WHERE t.user_id IS NOT NULL AND s.user_id IS NULL',
	p_schema,
	p_table
);

-- Fix invalid or null values to 30
UPDATE
	public.user_settings
SET
	retention_days = 30
WHERE
	retention_days IS NULL
	OR retention_days NOT IN (7, 30, 90);

-- Per-row retention: coalesce(user value, 30)
retention_expr := format(
	'coalesce((select s.retention_days from public.user_settings s where s.user_id = %I.user_id), 30)',
	p_table
);

ELSE -- No user_id, always 30
retention_expr := '30';

END IF;

-- 4) build conditions
IF has_deleted THEN cond_a := format(
	'%I.deleted_at IS NOT NULL AND %I.deleted_at <= (now() - ( %s || '' days'' )::interval)',
	p_table,
	p_table,
	retention_expr
);

ELSE cond_a := 'false';

END IF;

IF has_trashed
AND has_updated THEN cond_b := format(
	'%I.trashed = true AND %I.updated_at <= (now() - ( %s || '' days'' )::interval)',
	p_table,
	p_table,
	retention_expr
);

ELSE cond_b := 'false';

END IF;

-- 5) delete using ctid for batch performance
EXECUTE format(
	'WITH to_del AS (
       SELECT ctid
       FROM %I.%I
       WHERE (%s) OR (%s)
     )
     DELETE FROM %I.%I t
     USING to_del d
     WHERE t.ctid = d.ctid
     RETURNING 1',
	p_schema,
	p_table,
	cond_a,
	cond_b,
	p_schema,
	p_table
) INTO deleted_count;

RETURN coalesce(deleted_count, 0);

END;

$$;
REVOKE ALL ON FUNCTION public.purge_soft_deleted(text, text)
FROM
	public;
GRANT EXECUTE ON FUNCTION public.purge_soft_deleted(text, text) TO authenticated,
service_role;
