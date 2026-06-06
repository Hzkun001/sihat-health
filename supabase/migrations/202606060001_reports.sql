create extension if not exists postgis with schema extensions;

do $$
begin
  create type public.report_status as enum (
    'baru',
    'diverifikasi',
    'diproses',
    'selesai',
    'ditolak'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.staff_role as enum ('admin', 'verifikator', 'petugas');
exception
  when duplicate_object then null;
end $$;

create sequence if not exists public.report_ticket_seq;

create or replace function public.generate_report_ticket()
returns text
language sql
volatile
security definer
set search_path = ''
as $$
  select 'SHT-' || to_char(current_date, 'YYYY') || '-' ||
    lpad(nextval('public.report_ticket_seq')::text, 6, '0');
$$;

revoke all on sequence public.report_ticket_seq from anon, authenticated;
revoke all on function public.generate_report_ticket() from public;
grant execute on function public.generate_report_ticket() to authenticated;

create table if not exists public.staff_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role public.staff_role not null default 'petugas',
  created_at timestamptz not null default now()
);

create or replace function public.is_staff()
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
  );
$$;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  ticket_number text not null unique default public.generate_report_ticket(),
  reporter_id uuid not null default auth.uid() references auth.users(id) on delete restrict,
  category text not null default 'lingkungan',
  description text not null check (char_length(description) between 10 and 2000),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  location extensions.geography(point, 4326)
    generated always as (
      extensions.st_setsrid(extensions.st_makepoint(longitude, latitude), 4326)::extensions.geography
    ) stored,
  photo_url text,
  photo_path text,
  status public.report_status not null default 'baru',
  rejection_reason text,
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists reports_location_idx on public.reports using gist (location);
create index if not exists reports_created_at_idx on public.reports (created_at desc);
create index if not exists reports_status_idx on public.reports (status);
create index if not exists reports_reporter_id_idx on public.reports (reporter_id);

create table if not exists public.report_comments (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  author_id uuid not null default auth.uid() references auth.users(id) on delete restrict,
  author_name text not null default 'Warga' check (char_length(author_name) between 1 and 80),
  message text not null check (char_length(message) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists report_comments_report_id_idx
  on public.report_comments (report_id, created_at);

create table if not exists public.report_updates (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  status public.report_status not null,
  title text not null,
  note text,
  actor_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists report_updates_report_id_idx
  on public.report_updates (report_id, created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  if new.status = 'selesai' and old.status is distinct from 'selesai' then
    new.resolved_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists reports_set_updated_at on public.reports;
create trigger reports_set_updated_at
before update on public.reports
for each row execute function public.set_updated_at();

create or replace function public.record_report_timeline()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  timeline_title text;
begin
  if tg_op = 'INSERT' then
    insert into public.report_updates (report_id, status, title, note, actor_id)
    values (
      new.id,
      new.status,
      'Laporan diterima',
      'Laporan telah masuk dan menunggu verifikasi.',
      new.reporter_id
    );
    return new;
  end if;

  if old.status is distinct from new.status then
    timeline_title := case new.status
      when 'diverifikasi' then 'Laporan diverifikasi'
      when 'diproses' then 'Penanganan dimulai'
      when 'selesai' then 'Laporan diselesaikan'
      when 'ditolak' then 'Laporan ditolak'
      else 'Status laporan diperbarui'
    end;

    insert into public.report_updates (report_id, status, title, note, actor_id)
    values (
      new.id,
      new.status,
      timeline_title,
      case when new.status = 'ditolak' then new.rejection_reason else null end,
      auth.uid()
    );
  end if;

  return new;
end;
$$;

drop trigger if exists reports_record_timeline on public.reports;
create trigger reports_record_timeline
after insert or update of status on public.reports
for each row execute function public.record_report_timeline();

alter table public.staff_profiles enable row level security;
alter table public.reports enable row level security;
alter table public.report_comments enable row level security;
alter table public.report_updates enable row level security;

revoke all on public.staff_profiles from anon, authenticated;
revoke all on public.reports from anon, authenticated;
revoke all on public.report_comments from anon, authenticated;
revoke all on public.report_updates from anon, authenticated;

grant select on public.reports to anon, authenticated;
grant insert, update on public.reports to authenticated;
grant select on public.report_comments to anon, authenticated;
grant insert on public.report_comments to authenticated;
grant select on public.report_updates to anon, authenticated;
grant select on public.staff_profiles to authenticated;
grant insert on public.report_updates to authenticated;

drop policy if exists "Public can read visible reports" on public.reports;
create policy "Public can read visible reports"
on public.reports
for select
to anon, authenticated
using (
  status <> 'ditolak'
  or reporter_id = (select auth.uid())
  or public.is_staff()
);

drop policy if exists "Authenticated users create own reports" on public.reports;
create policy "Authenticated users create own reports"
on public.reports
for insert
to authenticated
with check (
  reporter_id = (select auth.uid())
  and status = 'baru'
  and assigned_to is null
  and rejection_reason is null
  and (
    photo_path is null
    or split_part(photo_path, '/', 1) = (select auth.uid())::text
  )
);

drop policy if exists "Reporters update pending report photo" on public.reports;

drop policy if exists "Staff manage all reports" on public.reports;
create policy "Staff manage all reports"
on public.reports
for update
to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "Public can read comments on visible reports" on public.report_comments;
create policy "Public can read comments on visible reports"
on public.report_comments
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.reports
    where reports.id = report_comments.report_id
  )
);

drop policy if exists "Authenticated users create comments" on public.report_comments;
create policy "Authenticated users create comments"
on public.report_comments
for insert
to authenticated
with check (
  author_id = (select auth.uid())
  and exists (
    select 1
    from public.reports
    where reports.id = report_comments.report_id
  )
);

drop policy if exists "Public can read report timeline" on public.report_updates;
create policy "Public can read report timeline"
on public.report_updates
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.reports
    where reports.id = report_updates.report_id
  )
);

drop policy if exists "Staff create report timeline entries" on public.report_updates;
create policy "Staff create report timeline entries"
on public.report_updates
for insert
to authenticated
with check (public.is_staff());

drop policy if exists "Staff read staff profiles" on public.staff_profiles;
create policy "Staff read staff profiles"
on public.staff_profiles
for select
to authenticated
using (public.is_staff());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'report-photos',
  'report-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users upload own report photos" on storage.objects;
create policy "Users upload own report photos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'report-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Users update own report photos" on storage.objects;
create policy "Users update own report photos"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'report-photos'
  and owner_id = (select auth.uid())::text
)
with check (
  bucket_id = 'report-photos'
  and owner_id = (select auth.uid())::text
);

drop policy if exists "Users delete own report photos" on storage.objects;
create policy "Users delete own report photos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'report-photos'
  and owner_id = (select auth.uid())::text
);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'reports'
  ) then
    alter publication supabase_realtime add table public.reports;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'report_comments'
  ) then
    alter publication supabase_realtime add table public.report_comments;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'report_updates'
  ) then
    alter publication supabase_realtime add table public.report_updates;
  end if;
end $$;
