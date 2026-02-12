
import { supabase } from '../lib/supabase';

export interface Workout {
    id: string;
    user_id: string;
    title: string;
    note: string | null;
    workout_date: string;
    created_at: string;
}

export interface Exercise {
    id: string;
    workout_id: string;
    name: string;
    created_at: string;
}

export interface Set {
    id: string;
    exercise_id: string;
    reps: number;
    weight: number;
    created_at: string;
}

export const workoutService = {
    /**
     * Fetch all workouts for the current user, including exercises and sets.
     */
    async getUserWorkouts() {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('workouts')
            .select(`
        *,
        exercises (
          *,
          sets (*)
        )
      `)
            .eq('user_id', user.id)
            .order('workout_date', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Create a new workout.
     */
    async createWorkout(workout: Partial<Workout>) {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('workouts')
            .insert({
                ...workout,
                user_id: user.id,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Delete a workout. 
     * Due to cascade delete settings in Supabase, this will automatically 
     * remove related exercises and sets.
     */
    async deleteWorkout(workoutId: string) {
        const { error } = await supabase
            .from('workouts')
            .delete()
            .eq('id', workoutId);

        if (error) throw error;
    },
};
