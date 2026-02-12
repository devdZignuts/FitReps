
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/auth.service';
import { sessionService } from '../../services/session.service';

// Define the shape of the user and session from the service layer perspective.
// We treat these as opaque objects here to avoid tight coupling, 
// trusting the service layer types.
type User = Awaited<ReturnType<typeof sessionService.getCurrentSession>> extends { user: infer U } | null ? U : any;
type Session = Awaited<ReturnType<typeof sessionService.getCurrentSession>>;

interface AuthState {
    user: User | null;
    session: Session | null;
    status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    session: null,
    status: 'idle',
    error: null,
};

// --- Thunks ---

export const initializeAuth = createAsyncThunk(
    'auth/initialize',
    async (_, { rejectWithValue }) => {
        try {
            const session = await sessionService.restoreSession();
            return session;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to restore session');
        }
    }
);

export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const { user, session } = await authService.signIn(email, password);
            return { user, session };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Login failed');
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const { user, session } = await authService.signUp(email, password);
            return { user, session };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Registration failed');
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await authService.signOut();
        } catch (error: any) {
            return rejectWithValue(error.message || 'Logout failed');
        }
    }
);

// --- Slice ---

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearAuthError(state) {
            state.error = null;
        },
        // Optional: Handler for manual session updates if needed (e.g. from listener)
        setSession(state, action: PayloadAction<Session | null>) {
            state.session = action.payload;
            state.user = action.payload?.user ?? null;
            state.status = action.payload ? 'authenticated' : 'unauthenticated';
        },
    },
    extraReducers: (builder) => {
        // Initialize
        builder.addCase(initializeAuth.pending, (state) => {
            state.status = 'loading';
            state.error = null;
        });
        builder.addCase(initializeAuth.fulfilled, (state, action) => {
            state.session = action.payload;
            state.user = action.payload?.user ?? null;
            state.status = action.payload ? 'authenticated' : 'unauthenticated';
        });
        builder.addCase(initializeAuth.rejected, (state, action) => {
            state.status = 'unauthenticated';
            state.error = action.payload as string;
        });

        // Login
        builder.addCase(login.pending, (state) => {
            state.status = 'loading';
            state.error = null;
        });
        builder.addCase(login.fulfilled, (state, action) => {
            state.session = action.payload.session;
            state.user = action.payload.user;
            state.status = 'authenticated';
        });
        builder.addCase(login.rejected, (state, action) => {
            state.status = 'unauthenticated'; // or keep previous state? usually unauthenticated on login fail
            state.error = action.payload as string;
        });

        // Register
        builder.addCase(register.pending, (state) => {
            state.status = 'loading';
            state.error = null;
        });
        builder.addCase(register.fulfilled, (state, action) => {
            state.session = action.payload.session;
            state.user = action.payload.user;
            // If session is null (email confirmation needed), status might be unauthenticated
            state.status = action.payload.session ? 'authenticated' : 'unauthenticated';
        });
        builder.addCase(register.rejected, (state, action) => {
            state.status = 'unauthenticated';
            state.error = action.payload as string;
        });

        // Logout
        builder.addCase(logout.fulfilled, (state) => {
            state.user = null;
            state.session = null;
            state.status = 'unauthenticated';
            state.error = null;
        });
        // Intentionally not handling logout failure to force UI clear state or handle differently? 
        // Usually we want to clear state anyway.
        builder.addCase(logout.rejected, (state, action) => {
            // Even if API logout fails, we usually want to clear local state
            state.user = null;
            state.session = null;
            state.status = 'unauthenticated';
            state.error = action.payload as string; // persist error message if needed
        });
    },
});

export const { clearAuthError, setSession } = authSlice.actions;
export default authSlice.reducer;
