-- Mitarbeiter-Abruf-App
-- Initiales Datenbankschema

create type public.user_role as enum ('admin', 'counter', 'employee');

create type public.job_status as enum (
  'open',
  'accepted',
  'completed',
  'cancelled',
  'expired'
);

create type public.job_type as enum (
  'staff_replacement',
  'extra_work',
  'vehicle_transfer',
  'other'
);

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  city text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role public.user_role not null default 'employee',
  branch_id uuid references public.branches(id),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.device_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  token text not null,
  platform text not null,
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  unique(user_id, token)
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  job_type public.job_type not null default 'other',
  branch_id uuid not null references public.branches(id),
  start_location text,
  destination_location text,
  starts_at timestamptz,
  estimated_duration_minutes integer,
  status public.job_status not null default 'open',
  created_by uuid not null references public.profiles(id),
  accepted_by uuid references public.profiles(id),
  accepted_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.job_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  event_type text not null,
  user_id uuid references public.profiles(id),
  note text,
  created_at timestamptz not null default now()
);

create index idx_profiles_branch_id on public.profiles(branch_id);
create index idx_profiles_role on public.profiles(role);
create index idx_device_tokens_user_id on public.device_tokens(user_id);
create index idx_jobs_branch_id on public.jobs(branch_id);
create index idx_jobs_status on public.jobs(status);
create index idx_jobs_created_by on public.jobs(created_by);
create index idx_jobs_accepted_by on public.jobs(accepted_by);
create index idx_job_events_job_id on public.job_events(job_id);

create or replace function public.accept_job(p_job_id uuid)
returns public.jobs
language plpgsql
security definer
as $$
declare
  v_job public.jobs;
begin
  update public.jobs
  set
    status = 'accepted',
    accepted_by = auth.uid(),
    accepted_at = now()
  where id = p_job_id
    and status = 'open'
  returning * into v_job;

  if v_job.id is null then
    raise exception 'Dieser Auftrag wurde bereits vergeben oder ist nicht mehr offen.';
  end if;

  insert into public.job_events(job_id, event_type, user_id, note)
  values (p_job_id, 'accepted', auth.uid(), 'Auftrag wurde angenommen');

  return v_job;
end;
$$;
