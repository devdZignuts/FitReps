
import { supabase } from '../lib/supabase';

// Helper to normalize errors
const handleError = (error: any) => {
    if (error) {
        throw new Error(error.message || 'An unknown authentication error occurred');
    }
};

export const authService = {
    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        console.log(data, error);

        if (error) handleError(error);

        return {
            user: data.user,
            session: data.session,
        };
    },

    async signUp(email: string, password: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        console.log(data, error);

        if (error) handleError(error);

        return {
            user: data.user,
            session: data.session, // may be null if email confirmation is required
        };
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) handleError(error);
    },

    async requestPasswordReset(email: string) {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) handleError(error);
    },

    async verifyOtp(email: string, otp: string) {
        // Assuming 'signup' type for email verification flow as per standard auth flows
        // If this is for password reset, it would be 'recovery'. 
        // Given the constraints, defaulting to 'signup' or 'email' (magic link) 
        // often works for general verification if configured.
        // However, 'signup' is safest for verifying new accounts.
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: 'signup',
        });

        if (error) handleError(error);

        return {
            user: data.user,
            session: data.session,
        };
    },

    async updatePassword(newPassword: string) {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) handleError(error);

        return {
            user: data.user,
        };
    },
};
