-- Training Program and Schedule Tables

create table public.training_programs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  split_type text not null, -- 'ppl', 'upper_lower', 'full_body', 'custom'
  start_date date not null,
  end_date date not null,
  rest_days_per_week integer not null,
  created_at timestamp with time zone default now()
);

create table public.training_schedule (
  id uuid default gen_random_uuid() primary key,
  program_id uuid references public.training_programs on delete cascade not null,
  user_id uuid references auth.users not null,
  workout_date date not null,
  workout_type text not null, -- 'push', 'pull', 'legs', 'upper', 'lower', 'full', 'rest'
  workout_id uuid references public.workouts(id) on delete set null,
  created_at timestamp with time zone default now()
);

alter table public.training_programs enable row level security;
alter table public.training_schedule enable row level security;

create policy "Users can manage their own programs"
  on public.training_programs for all
  using (auth.uid() = user_id);

create policy "Users can manage their own schedule"
  on public.training_schedule for all
  using (auth.uid() = user_id);

create index training_schedule_user_date_idx on public.training_schedule(user_id, workout_date);
create index training_schedule_program_id_idx on public.training_schedule(program_id);
