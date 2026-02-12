-- Periodized Training System Extensions

alter table public.training_programs 
add column if not exists status text default 'active' check (status in ('active', 'completed', 'aborted'));

alter table public.training_programs 
add column if not exists weekly_pattern jsonb;

alter table public.training_schedule 
add column if not exists focus_type text;

-- Function to handle program abortion
create or replace function public.abort_training_program(p_program_id uuid)
returns void as $$
begin
    -- Update program status
    update public.training_programs
    set status = 'aborted'
    where id = p_program_id;

    -- Delete future scheduled workouts that haven't been started
    delete from public.training_schedule
    where program_id = p_program_id
    and workout_date > now()::date
    and workout_id is null;
end;
$$ language plpgsql security definer;

alter table public.training_schedule 
add column if not exists official_program_id text;

alter table public.training_schedule 
add column if not exists official_workout_id text;
