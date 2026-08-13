-- Security hardening for existing installations.
-- Apply after 202606060003_report_operations.sql.

-- Keep report photos private even if an earlier migration is rerun.
update storage.buckets
set public = false
where id = 'report-photos';

create or replace function public.has_staff_role(
  allowed_roles public.staff_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.staff_profiles
    where user_id = (select auth.uid())
      and role = any (allowed_roles)
  );
$$;

revoke all on function public.has_staff_role(public.staff_role[]) from public;
grant execute on function public.has_staff_role(public.staff_role[]) to authenticated;

create or replace function public.update_report_status(
  p_report_id uuid,
  p_status public.report_status,
  p_rejection_reason text default null
)
returns public.reports
language plpgsql
security invoker
set search_path = public
as $$
 declare
   result public.reports;
 begin
   if not public.has_staff_role(array['admin', 'verifikator']::public.staff_role[]) then
     raise exception 'Insufficient role for report moderation';
   end if;

   if p_status = 'ditolak' and char_length(btrim(coalesce(p_rejection_reason, ''))) < 2 then
     raise exception 'Rejection reason is required';
   end if;

   update public.reports
   set
     status = p_status,
     rejection_reason = case
       when p_status = 'ditolak' then btrim(p_rejection_reason)
       else null
     end
   where id = p_report_id
   returning * into result;

   if result.id is null then
     raise exception 'Report not found';
   end if;

   return result;
 end;
$$;

grant execute on function public.update_report_status(uuid, public.report_status, text) to authenticated;

create or replace function public.update_report_publication(
  p_report_id uuid,
  p_is_public boolean
)
returns public.reports
language plpgsql
security invoker
set search_path = public
as $$
 declare
   result public.reports;
 begin
   if not public.has_staff_role(array['admin', 'verifikator']::public.staff_role[]) then
     raise exception 'Insufficient role for publication moderation';
   end if;

   update public.reports
   set is_public = p_is_public
   where id = p_report_id
   returning * into result;

   if result.id is null then
     raise exception 'Report not found';
   end if;

   return result;
 end;
$$;

grant execute on function public.update_report_publication(uuid, boolean) to authenticated;

create or replace function public.update_report_operations(
  p_report_id uuid,
  p_priority public.report_priority default null,
  p_assigned_to uuid default null,
  p_due_at timestamptz default null,
  p_clear_priority boolean default false,
  p_clear_assigned_to boolean default false,
  p_clear_due_at boolean default false
)
returns public.reports
language plpgsql
security invoker
set search_path = public
as $$
 declare
   result public.reports;
 begin
   if not public.has_staff_role(array['admin', 'petugas']::public.staff_role[]) then
     raise exception 'Insufficient role for report operations';
   end if;

   update public.reports
   set
     priority = case when p_clear_priority then 'normal' else coalesce(p_priority, priority) end,
     assigned_to = case when p_clear_assigned_to then null else coalesce(p_assigned_to, assigned_to) end,
     due_at = case when p_clear_due_at then null else coalesce(p_due_at, due_at) end
   where id = p_report_id
   returning * into result;

   if result.id is null then
     raise exception 'Report not found';
   end if;

   return result;
 end;
$$;

grant execute on function public.update_report_operations(uuid, public.report_priority, uuid, timestamptz, boolean, boolean, boolean) to authenticated;

-- Direct table updates are disabled after the RPCs are available.
revoke update on public.reports from authenticated;
revoke insert on public.report_updates from authenticated;

-- Do not allow client-side mutation of audit history.
revoke insert, update, delete on public.report_audit_log from anon, authenticated;

-- Validate invariants that previously depended only on the browser.
alter table public.reports
  drop constraint if exists reports_category_length_check,
  drop constraint if exists reports_rejection_reason_check,
  drop constraint if exists reports_public_status_check;

alter table public.report_comments
  drop constraint if exists report_comments_message_length_check;

alter table public.report_comments
  add constraint report_comments_message_length_check
  check (char_length(btrim(message)) between 1 and 1000);

alter table public.reports
  add constraint reports_category_length_check
  check (char_length(btrim(category)) between 1 and 80),
  add constraint reports_public_status_check
  check (
    not is_public
    or status in ('diverifikasi', 'diproses', 'selesai')
  ),
  add constraint reports_rejection_reason_check
  check (
    status <> 'ditolak'
    or char_length(btrim(coalesce(rejection_reason, ''))) between 2 and 1000
  );

-- Keep report audit history when a report is removed. This is intentionally
-- restrictive: deletion must be an explicit, audited administrative action.
alter table public.report_audit_log
  drop constraint if exists report_audit_log_report_id_fkey;

alter table public.report_audit_log
  add constraint report_audit_log_report_id_fkey
  foreign key (report_id)
  references public.reports(id)
  on delete restrict;
