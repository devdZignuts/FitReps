-- ==========================================
-- FitReps FULL DATABASE SCHEMA SETUP
-- Includes: Workouts, Exercises, Sets, and Body Weight Tracking
-- ==========================================

-- 1. Create Workouts Table (if not exists)
create table if not exists public.workouts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  note text,
  workout_date date not null default now(),
  created_at timestamp with time zone default now()
);

-- 2. Create Exercises Table (if not exists)
create table if not exists public.exercises (
  id uuid default gen_random_uuid() primary key,
  workout_id uuid references public.workouts on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default now()
);

-- 3. Create Sets Table (if not exists)
create table if not exists public.sets (
  id uuid default gen_random_uuid() primary key,
  exercise_id uuid references public.exercises on delete cascade not null,
  reps integer not null,
  weight numeric not null,
  created_at timestamp with time zone default now()
);

-- 4. Create Body Weight Logs Table (if not exists)
create table if not exists public.body_weight_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  weight_kg numeric not null,
  date date not null default now(),
  created_at timestamp with time zone default now(),
  unique (user_id, date)
);

-- 5. Enable RLS (Row Level Security)
alter table public.workouts enable row level security;
alter table public.exercises enable row level security;
alter table public.sets enable row level security;
alter table public.body_weight_logs enable row level security;

-- 6. Create RLS Policies (Idempotent using DO blocks)

-- Workouts Policy
do $$
begin
    if not exists (select 1 from pg_policies where policyname = 'Users can manage their own workouts') then
        create policy "Users can manage their own workouts" on public.workouts for all using (auth.uid() = user_id);
    end if;
end
$$;

-- Exercises Policy
do $$
begin
    if not exists (select 1 from pg_policies where policyname = 'Users can manage their own exercises') then
        create policy "Users can manage their own exercises" on public.exercises for all using (
            exists (select 1 from public.workouts where public.workouts.id = public.exercises.workout_id and public.workouts.user_id = auth.uid())
        );
    end if;
end
$$;

-- Sets Policy
do $$
begin
    if not exists (select 1 from pg_policies where policyname = 'Users can manage their own sets') then
        create policy "Users can manage their own sets" on public.sets for all using (
            exists (
                select 1 from public.exercises
                join public.workouts on public.workouts.id = public.exercises.workout_id
                where public.exercises.id = public.sets.exercise_id
                and public.workouts.user_id = auth.uid()
            )
        );
    end if;
end
$$;

-- Weight Logs Policy
do $$
begin
    if not exists (select 1 from pg_policies where policyname = 'Users can manage their own weight logs') then
        create policy "Users can manage their own weight logs" on public.body_weight_logs for all using (auth.uid() = user_id);
    end if;
end
$$;

-- 7. Create Performance Indexes
create index if not exists workouts_user_id_idx on public.workouts(user_id);
create index if not exists exercises_workout_id_idx on public.exercises(workout_id);
create index if not exists sets_exercise_id_idx on public.sets(exercise_id);
create index if not exists body_weight_logs_user_date_idx on public.body_weight_logs(user_id, date desc);

-- 8. Final Verification
-- This will return the table names that were successfully created/verified
select table_name 
from information_schema.tables 
where table_schema = 'public' 
and table_name in ('workouts', 'exercises', 'sets', 'body_weight_logs');
