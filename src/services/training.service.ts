import { supabase } from '../lib/supabase';

export interface TrainingProgram {
    id: string;
    user_id: string;
    name: string;
    split_type: string;
    start_date: string;
    end_date: string;
    rest_days_per_week: number;
    status: 'active' | 'completed' | 'aborted';
    weekly_pattern: string[];
    created_at: string;
}

export interface TrainingSchedule {
    id: string;
    program_id: string;
    user_id: string;
    workout_date: string;
    workout_type: string;
    focus_type?: string;
    official_program_id?: string;
    official_workout_id?: string;
    workout_id?: string | null;
    created_at: string;
}

export const trainingService = {
    async createProgram(program: Partial<TrainingProgram>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('training_programs')
            .insert({ ...program, user_id: user.id })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async createScheduleItems(items: Partial<TrainingSchedule>[]) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const itemsWithUser = items.map(item => ({ ...item, user_id: user.id }));
        const { data, error } = await supabase
            .from('training_schedule')
            .insert(itemsWithUser)
            .select();

        if (error) throw error;
        return data;
    },

    async getActiveProgram() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const now = new Date();
        const today = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('training_programs')
            .select('*')
            .eq('status', 'active')
            .lte('start_date', today)
            .gte('end_date', today)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data || null;
    },

    async abortProgram(programId: string) {
        // Try to use the robust SQL function first
        const { error: rpcError } = await supabase.rpc('abort_training_program', {
            p_program_id: programId
        });

        if (!rpcError) return;

        // Fallback to manual update if RPC fails (e.g., function not created)
        console.warn('RPC abort_training_program failed, falling back to manual update:', rpcError);

        const now = new Date();
        const today = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

        // 1. Update program status manually
        const { error: updateError } = await supabase
            .from('training_programs')
            .update({ status: 'aborted' })
            .eq('id', programId);

        if (updateError) throw updateError;

        // 2. Delete future schedule items manually
        const { error: deleteError } = await supabase
            .from('training_schedule')
            .delete()
            .eq('program_id', programId)
            .is('workout_id', null)
            .gte('workout_date', today);

        if (deleteError) throw deleteError;
    },

    async getTodaySchedule() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const now = new Date();
        const today = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('training_schedule')
            .select('*, workout_id')
            .eq('workout_date', today)
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data || null;
    },

    async getFullSchedule() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Use !inner join to only include schedule items from non-aborted programs
        const { data, error } = await supabase
            .from('training_schedule')
            .select('*, training_programs!inner(name, status)')
            .eq('user_id', user.id)
            .neq('training_programs.status', 'aborted')
            .order('workout_date', { ascending: true });

        if (error) throw error;
        return data;
    },

    async linkWorkoutToSchedule(scheduleId: string, workoutId: string) {
        const { data, error } = await supabase
            .from('training_schedule')
            .update({ workout_id: workoutId })
            .eq('id', scheduleId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
