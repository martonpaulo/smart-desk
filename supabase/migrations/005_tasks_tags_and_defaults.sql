alter table public.tasks
  rename column tag to tags;

alter table public.tasks
  alter column tags drop not null,
  alter column planned_date set default current_date;

update public.tasks
set tags = case
  when tags is null or btrim(tags) = '' then null
  else to_jsonb(array_remove(regexp_split_to_array(tags, '\\s*,\\s*'), ''))::text
end;
