import { supabase } from '../lib/supabase';

export interface Set {
    id: string;
    exercise_id: string;
    reps: number;
    weight: number;
    created_at: string;
}

export const setService = {
    async getSets(exerciseId: string) {
        const { data, error } = await supabase
            .from('sets')
            .select('*')
            .eq('exercise_id', exerciseId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    },

    async createSet(exerciseId: string, reps: number, weight: number) {
        const { data, error } = await supabase
            .from('sets')
            .insert({ exercise_id: exerciseId, reps, weight })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteSet(id: string) {
        const { error } = await supabase
            .from('sets')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async updateSet(id: string, reps: number, weight: number) {
        const { data, error } = await supabase
            .from('sets')
            .update({ reps, weight })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getLastPerformedSet(exerciseName: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Verify this query structure carefully. 
        // We need to find sets for exercises with the given name, belonging to the user.
        // This requires a join across sets -> exercises -> workouts (filter by user_id)

        const { data, error } = await supabase
            .from('sets')
            .select(`
                reps, 
                weight,
                created_at,
                exercises!inner (
                    name,
                    workouts!inner (
                        user_id,
                        workout_date
                    )
                )
            `)
            .eq('exercises.name', exerciseName)
            .eq('exercises.workouts.user_id', user.id)
            .gt('weight', 0) // Only meaningful sets
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        return data;
    }
};
