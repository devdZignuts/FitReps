-- Create Profiles Table (if not exists)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  goal text,
  experience_level text,
  gender text,
  date_of_birth date,
  weight_kg numeric,
  height_cm numeric,
  is_onboarded boolean default false,
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Idempotent Policies using DO blocks
do $$
begin
    if not exists (select 1 from pg_policies where policyname = 'Users can view their own profile' and tablename = 'profiles') then
        create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);
    end if;
    
    if not exists (select 1 from pg_policies where policyname = 'Users can update their own profile' and tablename = 'profiles') then
        create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);
    end if;
    
    if not exists (select 1 from pg_policies where policyname = 'Users can insert their own profile' and tablename = 'profiles') then
        create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
    end if;
end
$$;

-- Function to handle profile creation on signup (idempotent)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile (idempotent check)
do $$
begin
    if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
        create trigger on_auth_user_created
          after insert on auth.users
          for each row execute procedure public.handle_new_user();
    end if;
end
$$;
