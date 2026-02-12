import { supabase } from '../lib/supabase';

export interface BodyWeightLog {
    id: string;
    user_id: string;
    weight_kg: number;
    date: string;
    created_at: string;
}

export const weightService = {
    async getWeightLogs() {
        const { data, error } = await supabase
            .from('body_weight_logs')
            .select('*')
            .order('date', { ascending: false });

        if (error) throw error;
        return data;
    },

    async logWeight(weightKg: number, date?: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const logDate = date || new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('body_weight_logs')
            .upsert({
                user_id: user.id,
                weight_kg: weightKg,
                date: logDate
            }, {
                onConflict: 'user_id,date'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getLatestWeight() {
        const { data, error } = await supabase
            .from('body_weight_logs')
            .select('*')
            .order('date', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is 'no rows found'
        return data || null;
    }
};
