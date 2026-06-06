alter table public.reports
  add column if not exists is_public boolean not null default false,
  add column if not exists published_at timestamptz,
  add column if not exists published_by uuid references auth.users(id) on delete set null,
  add column if not exists privacy_consent_at timestamptz;

create index if not exists reports_public_created_at_idx
  on public.reports (is_public, created_at desc);

create or replace function public.set_report_publication_metadata()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status in ('baru', 'ditolak') then
    new.is_public = false;
  end if;

  if old.is_public is distinct from new.is_public then
    if not public.is_staff() then
      raise exception 'Only staff can change report publication';
    end if;

    if new.is_public then
      new.published_at = now();
      new.published_by = auth.uid();
    else
      new.published_at = null;
      new.published_by = null;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists reports_set_publication_metadata on public.reports;
create trigger reports_set_publication_metadata
before update of is_public, status on public.reports
for each row execute function public.set_report_publication_metadata();

drop policy if exists "Public can read visible reports" on public.reports;
create policy "Public can read moderated reports"
on public.reports
for select
to anon, authenticated
using (
  is_public
  or reporter_id = (select auth.uid())
  or public.is_staff()
);

drop policy if exists "Authenticated users create own reports" on public.reports;
create policy "Authenticated users create private reports"
on public.reports
for insert
to authenticated
with check (
  reporter_id = (select auth.uid())
  and status = 'baru'
  and is_public = false
  and published_at is null
  and published_by is null
  and privacy_consent_at is not null
  and assigned_to is null
  and rejection_reason is null
  and (
    photo_path is null
    or split_part(photo_path, '/', 1) = (select auth.uid())::text
  )
);

drop policy if exists "Public can read comments on visible reports" on public.report_comments;
create policy "Readers can read comments on accessible reports"
on public.report_comments
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.reports
    where reports.id = report_comments.report_id
      and (
        reports.is_public
        or reports.reporter_id = (select auth.uid())
        or public.is_staff()
      )
  )
);

drop policy if exists "Authenticated users create comments" on public.report_comments;
create policy "Authenticated users comment on accessible reports"
on public.report_comments
for insert
to authenticated
with check (
  author_id = (select auth.uid())
  and exists (
    select 1
    from public.reports
    where reports.id = report_comments.report_id
      and (
        reports.is_public
        or reports.reporter_id = (select auth.uid())
        or public.is_staff()
      )
  )
);

drop policy if exists "Public can read report timeline" on public.report_updates;
create policy "Readers can read timeline on accessible reports"
on public.report_updates
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.reports
    where reports.id = report_updates.report_id
      and (
        reports.is_public
        or reports.reporter_id = (select auth.uid())
        or public.is_staff()
      )
  )
);

create or replace function public.can_read_report_photo(object_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.reports
    where photo_path = object_name
      and (
        is_public
        or reporter_id = (select auth.uid())
        or public.is_staff()
      )
  );
$$;

revoke all on function public.can_read_report_photo(text) from public;
grant execute on function public.can_read_report_photo(text) to anon, authenticated;

update storage.buckets
set public = false
where id = 'report-photos';

drop policy if exists "Readers access moderated report photos" on storage.objects;
create policy "Readers access moderated report photos"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'report-photos'
  and public.can_read_report_photo(name)
);
