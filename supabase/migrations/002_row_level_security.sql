-- Mitarbeiter-Abruf-App
-- Row Level Security Regeln

alter table public.branches enable row level security;
alter table public.profiles enable row level security;
alter table public.device_tokens enable row level security;
alter table public.jobs enable row level security;
alter table public.job_events enable row level security;

-- Hilfsfunktion: Rolle des aktuellen Benutzers
create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
stable
as $$
  select role
  from public.profiles
  where id = auth.uid()
$$;

-- Hilfsfunktion: Filiale des aktuellen Benutzers
create or replace function public.current_user_branch_id()
returns uuid
language sql
security definer
stable
as $$
  select branch_id
  from public.profiles
  where id = auth.uid()
$$;

-- BRANCHES

create policy "Admins can manage branches"
on public.branches
for all
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "Authenticated users can view active branches"
on public.branches
for select
to authenticated
using (active = true);

-- PROFILES

create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "Admins can view all profiles"
on public.profiles
for select
to authenticated
using (public.current_user_role() = 'admin');

create policy "Counters can view employees in own branch"
on public.profiles
for select
to authenticated
using (
  public.current_user_role() = 'counter'
  and branch_id = public.current_user_branch_id()
);

create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (
  id = auth.uid()
  and role = 'employee'
);

create policy "Users can update own basic profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and role = public.current_user_role()
);

create policy "Admins can manage profiles"
on public.profiles
for all
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

-- DEVICE TOKENS

create policy "Users can manage own device tokens"
on public.device_tokens
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Admins can view all device tokens"
on public.device_tokens
for select
to authenticated
using (public.current_user_role() = 'admin');

-- JOBS

create policy "Admins can manage all jobs"
on public.jobs
for all
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "Counters can view jobs in own branch"
on public.jobs
for select
to authenticated
using (
  public.current_user_role() = 'counter'
  and branch_id = public.current_user_branch_id()
);

create policy "Counters can create jobs in own branch"
on public.jobs
for insert
to authenticated
with check (
  public.current_user_role() = 'counter'
  and branch_id = public.current_user_branch_id()
  and created_by = auth.uid()
);

create policy "Counters can update own branch jobs"
on public.jobs
for update
to authenticated
using (
  public.current_user_role() = 'counter'
  and branch_id = public.current_user_branch_id()
)
with check (
  public.current_user_role() = 'counter'
  and branch_id = public.current_user_branch_id()
);

create policy "Employees can view open jobs in own branch"
on public.jobs
for select
to authenticated
using (
  public.current_user_role() = 'employee'
  and branch_id = public.current_user_branch_id()
  and status = 'open'
);

create policy "Employees can view accepted own jobs"
on public.jobs
for select
to authenticated
using (
  public.current_user_role() = 'employee'
  and accepted_by = auth.uid()
);

-- Mitarbeiter sollen Jobs nicht direkt updaten.
-- Annahme erfolgt nur über public.accept_job().

-- JOB EVENTS

create policy "Admins can view all job events"
on public.job_events
for select
to authenticated
using (public.current_user_role() = 'admin');

create policy "Counters can view own branch job events"
on public.job_events
for select
to authenticated
using (
  public.current_user_role() = 'counter'
  and exists (
    select 1
    from public.jobs j
    where j.id = job_events.job_id
      and j.branch_id = public.current_user_branch_id()
  )
);

create policy "Employees can view own job events"
on public.job_events
for select
to authenticated
using (
  public.current_user_role() = 'employee'
  and exists (
    select 1
    from public.jobs j
    where j.id = job_events.job_id
      and j.accepted_by = auth.uid()
  )
);

create policy "System can insert job events through functions"
on public.job_events
for insert
to authenticated
with check (user_id = auth.uid());

