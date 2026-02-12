-- ===================================================
-- SUPER FIX SCRIPT
-- Run this in Supabase SQL Editor to fix everything
-- ===================================================

-- 1. FIX THE STATUS CONSTRAINT (Allow 'aborted')
ALTER TABLE public.training_programs 
DROP CONSTRAINT IF EXISTS training_programs_status_check;

ALTER TABLE public.training_programs 
ADD CONSTRAINT training_programs_status_check 
CHECK (status IN ('active', 'completed', 'aborted'));

-- 2. CREATE THE ABORT FUNCTION (Robust Logic)
CREATE OR REPLACE FUNCTION abort_training_program(p_program_id uuid)
RETURNS void AS $$
BEGIN
    -- Update specific program to aborted
    UPDATE training_programs
    SET status = 'aborted'
    WHERE id = p_program_id;

    -- Delete ONLY future, unlogged schedule items for this program
    DELETE FROM training_schedule
    WHERE program_id = p_program_id
    AND workout_id IS NULL
    AND workout_date >= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- 3. CLEAN UP DUPLICATES (The "Reset" Button)
-- This will safety abort ALL currently active programs and clean their future schedules.
-- This ensures you start fresh without "ghost" programs showing up.

DO $$
DECLARE
    prog RECORD;
BEGIN
    FOR prog IN SELECT id FROM training_programs WHERE status = 'active'
    LOOP
        PERFORM abort_training_program(prog.id);
    END LOOP;
END $$;
