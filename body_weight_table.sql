-- Body Weight Tracking Table (Fixed with Unique Constraint)

-- Drop if exists (only for clean reinstall)
-- drop table if exists public.body_weight_logs;

create table if not exists public.body_weight_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  weight_kg numeric not null,
  date date not null default now(),
  created_at timestamp with time zone default now(),
  -- CRITICAL for upsert behavior:
  unique (user_id, date)
);

alter table public.body_weight_logs enable row level security;

-- Policy (using do-block to avoid errors if it exists)
do $$
begin
    if not exists (
        select 1 from pg_policies where tablename = 'body_weight_logs' and policyname = 'Users can manage their own weight logs'
    ) then
        create policy "Users can manage their own weight logs"
          on public.body_weight_logs for all
          using (auth.uid() = user_id);
    end if;
end
$$;

create index if not exists body_weight_logs_user_date_idx on public.body_weight_logs(user_id, date desc);

-- Verification Query
select count(*) from public.body_weight_logs;
