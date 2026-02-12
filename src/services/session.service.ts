
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export const sessionService = {
    /**
     * Retrieves the current session from Supabase client.
     */
    async getCurrentSession(): Promise<Session | null> {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            throw new Error(error.message);
        }

        return data.session;
    },

    /**
     * Restores session from storage (via Supabase client).
     * In this phase, it relies on the configured storage adapter.
     */
    async restoreSession(): Promise<Session | null> {
        return this.getCurrentSession();
    },

    /**
     * Clears the current session.
     */
    async clearSession(): Promise<void> {
        const { error } = await supabase.auth.signOut();
        if (error) {
            throw new Error(error.message);
        }
    },

    /**
     * Listens to authentication state changes.
     * Internal Supabase listener handles auto-refresh tokens.
     */
    listenToAuthChanges(callback: (session: Session | null) => void) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            callback(session);
        });

        return {
            unsubscribe: () => {
                subscription.unsubscribe();
            },
        };
    },
};
