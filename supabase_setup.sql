-- FitReps Database Setup Script
-- Copy this entire file and paste it into Supabase SQL Editor

-- 1. Create Workouts Table
create table public.workouts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  note text,
  workout_date date not null default now(),
  created_at timestamp with time zone default now()
);

-- 2. Create Exercises Table
create table public.exercises (
  id uuid default gen_random_uuid() primary key,
  workout_id uuid references public.workouts on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default now()
);

-- 3. Create Sets Table
create table public.sets (
  id uuid default gen_random_uuid() primary key,
  exercise_id uuid references public.exercises on delete cascade not null,
  reps integer not null,
  weight numeric not null,
  created_at timestamp with time zone default now()
);

-- 4. Enable RLS (Row Level Security)
alter table public.workouts enable row level security;
alter table public.exercises enable row level security;
alter table public.sets enable row level security;

-- 5. Create RLS Policies
create policy "Users can manage their own workouts"
  on public.workouts for all
  using (auth.uid() = user_id);

create policy "Users can manage their own exercises"
  on public.exercises for all
  using (
    exists (
      select 1 from public.workouts
      where public.workouts.id = public.exercises.workout_id
      and public.workouts.user_id = auth.uid()
    )
  );

create policy "Users can manage their own sets"
  on public.sets for all
  using (
    exists (
      select 1 from public.exercises
      join public.workouts on public.workouts.id = public.exercises.workout_id
      where public.exercises.id = public.sets.exercise_id
      and public.workouts.user_id = auth.uid()
    )
  );
