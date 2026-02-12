
import { supabase } from '../lib/supabase';

export interface Profile {
    id: string;
    goal: string | null;
    experience_level: string | null;
    gender: string | null;
    date_of_birth: string | null;
    weight_kg: number | null;
    height_cm: number | null;
    is_onboarded: boolean;
    updated_at: string;
}

export const profileService = {
    async getProfile() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        if (error) throw error;
        return data as Profile | null;
    },

    async updateProfile(updates: Partial<Profile>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('profiles')
            .upsert({ ...updates, id: user.id, updated_at: new Date().toISOString() })
            .select()
            .single();

        if (error) throw error;
        return data as Profile;
    }
};
