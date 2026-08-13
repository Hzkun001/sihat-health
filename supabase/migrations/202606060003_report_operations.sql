do $$
begin
  create type public.report_priority as enum ('rendah', 'normal', 'tinggi', 'darurat');
exception
  when duplicate_object then null;
end $$;

alter table public.reports
  add column if not exists priority public.report_priority not null default 'normal',
  add column if not exists due_at timestamptz;

create index if not exists reports_priority_due_at_idx
  on public.reports (priority, due_at);
create index if not exists reports_assigned_to_idx
  on public.reports (assigned_to, status);

create or replace function public.report_sla_interval(priority public.report_priority)
returns interval
language sql
immutable
set search_path = ''
as $$
  select case priority
    when 'darurat' then interval '4 hours'
    when 'tinggi' then interval '24 hours'
    when 'normal' then interval '72 hours'
    else interval '7 days'
  end;
$$;

create or replace function public.set_report_operations()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.assigned_to is not null and not exists (
    select 1
    from public.staff_profiles
    where user_id = new.assigned_to
  ) then
    raise exception 'Report can only be assigned to a registered staff account';
  end if;

  if tg_op = 'INSERT' or old.priority is distinct from new.priority then
    new.due_at = coalesce(new.created_at, now()) + public.report_sla_interval(new.priority);
  end if;

  return new;
end;
$$;

drop trigger if exists reports_set_operations on public.reports;
create trigger reports_set_operations
before insert or update of priority, assigned_to, due_at on public.reports
for each row execute function public.set_report_operations();

update public.reports
set due_at = created_at + public.report_sla_interval(priority)
where due_at is null;

create table if not exists public.report_internal_notes (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  author_id uuid not null default auth.uid() references auth.users(id) on delete restrict,
  message text not null check (char_length(message) between 2 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists report_internal_notes_report_id_idx
  on public.report_internal_notes (report_id, created_at desc);

create table if not exists public.report_audit_log (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  changes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists report_audit_log_report_id_idx
  on public.report_audit_log (report_id, created_at desc);

create or replace function public.record_report_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  change_set jsonb := '{}'::jsonb;
begin
  if old.status is distinct from new.status then
    change_set := change_set || jsonb_build_object(
      'status',
      jsonb_build_object('before', old.status, 'after', new.status)
    );
  end if;

  if old.priority is distinct from new.priority then
    change_set := change_set || jsonb_build_object(
      'priority',
      jsonb_build_object('before', old.priority, 'after', new.priority)
    );
  end if;

  if old.assigned_to is distinct from new.assigned_to then
    change_set := change_set || jsonb_build_object(
      'assigned_to',
      jsonb_build_object('before', old.assigned_to, 'after', new.assigned_to)
    );
  end if;

  if old.due_at is distinct from new.due_at then
    change_set := change_set || jsonb_build_object(
      'due_at',
      jsonb_build_object('before', old.due_at, 'after', new.due_at)
    );
  end if;

  if old.is_public is distinct from new.is_public then
    change_set := change_set || jsonb_build_object(
      'is_public',
      jsonb_build_object('before', old.is_public, 'after', new.is_public)
    );
  end if;

  if old.rejection_reason is distinct from new.rejection_reason then
    change_set := change_set || jsonb_build_object(
      'rejection_reason',
      jsonb_build_object('before', old.rejection_reason, 'after', new.rejection_reason)
    );
  end if;

  if change_set <> '{}'::jsonb then
    insert into public.report_audit_log (report_id, actor_id, action, changes)
    values (new.id, auth.uid(), 'report_updated', change_set);
  end if;

  return new;
end;
$$;

drop trigger if exists reports_record_audit on public.reports;
create trigger reports_record_audit
after update of status, priority, assigned_to, due_at, is_public, rejection_reason
on public.reports
for each row execute function public.record_report_audit();

alter table public.report_internal_notes enable row level security;
alter table public.report_audit_log enable row level security;

revoke all on public.report_internal_notes from anon, authenticated;
revoke all on public.report_audit_log from anon, authenticated;

grant select, insert (report_id, message) on public.report_internal_notes to authenticated;
grant select on public.report_audit_log to authenticated;

revoke insert, update, delete on public.report_audit_log from anon, authenticated;

drop policy if exists "Staff manage internal notes" on public.report_internal_notes;
create policy "Staff read internal notes"
on public.report_internal_notes
for select
to authenticated
using (public.is_staff());

create policy "Staff create internal notes"
on public.report_internal_notes
for insert
to authenticated
with check (
  public.is_staff()
  and author_id = (select auth.uid())
);

drop policy if exists "Staff read report audit log" on public.report_audit_log;
create policy "Staff read report audit log"
on public.report_audit_log
for select
to authenticated
using (public.is_staff());

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'report_internal_notes'
  ) then
    alter publication supabase_realtime add table public.report_internal_notes;
  end if;
end $$;
