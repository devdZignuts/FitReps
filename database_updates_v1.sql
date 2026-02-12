-- ==========================================
-- FitReps LATEST DATABASE UPDATES
-- Run these in your Supabase SQL Editor
-- ==========================================

-- 1. Ensure Training Program Status exists
-- Adding column if it doesn't exist, and setting a default
ALTER TABLE public.training_programs 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- Add a check constraint to ensure valid statuses
ALTER TABLE public.training_programs 
DROP CONSTRAINT IF EXISTS training_programs_status_check;

ALTER TABLE public.training_programs 
ADD CONSTRAINT training_programs_status_check 
CHECK (status IN ('active', 'completed', 'aborted'));

-- 2. Ensure Schedule linking to Workouts
ALTER TABLE public.training_schedule 
ADD COLUMN IF NOT EXISTS workout_id uuid REFERENCES public.workouts(id) ON DELETE SET NULL;

-- 3. Automatic Linking Trigger
-- This ensures that when you save a workout, it automatically connects to your program schedule
CREATE OR REPLACE FUNCTION link_workout_to_schedule()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE training_schedule
    SET workout_id = NEW.id
    WHERE user_id = NEW.user_id 
    AND workout_date = NEW.workout_date
    AND workout_id IS NULL;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_link_workout_to_schedule ON public.workouts;
CREATE TRIGGER tr_link_workout_to_schedule
AFTER INSERT ON public.workouts
FOR EACH ROW
EXECUTE FUNCTION link_workout_to_schedule();

-- 4. Unified Delete for Program Abortion (Optional but recommended)
-- This cleans up all future un-logged workouts when a program is aborted
CREATE OR REPLACE FUNCTION abort_training_program(p_program_id uuid)
RETURNS void AS $$
BEGIN
    -- Set status to aborted
    UPDATE training_programs
    SET status = 'aborted'
    WHERE id = p_program_id;

    -- Delete all future schedule items that haven't been completed
    DELETE FROM training_schedule
    WHERE program_id = p_program_id
    AND workout_id IS NULL
    AND workout_date >= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;
