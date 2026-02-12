import { supabase } from '../lib/supabase';

export interface Exercise {
    id: string;
    workout_id: string;
    name: string;
    created_at: string;
}

export const exerciseService = {
    async getExercises(workoutId: string) {
        const { data, error } = await supabase
            .from('exercises')
            .select('*')
            .eq('workout_id', workoutId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    },

    async createExercise(workoutId: string, name: string) {
        const { data, error } = await supabase
            .from('exercises')
            .insert({ workout_id: workoutId, name })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteExercise(id: string) {
        const { error } = await supabase
            .from('exercises')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};
