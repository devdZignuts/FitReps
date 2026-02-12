
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { profileService, Profile } from '../../services/profile.service';

interface ProfileState {
    profile: Profile | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: ProfileState = {
    profile: null,
    status: 'idle',
    error: null,
};

export const fetchProfile = createAsyncThunk(
    'profile/fetch',
    async (_, { rejectWithValue }) => {
        try {
            return await profileService.getProfile();
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch profile');
        }
    }
);

export const updateProfile = createAsyncThunk(
    'profile/update',
    async (updates: Partial<Profile>, { rejectWithValue }) => {
        try {
            return await profileService.updateProfile(updates);
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to update profile');
        }
    }
);

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        resetProfile(state) {
            state.profile = null;
            state.status = 'idle';
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Profile
            .addCase(fetchProfile.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchProfile.fulfilled, (state, action: PayloadAction<Profile | null>) => {
                state.status = 'succeeded';
                state.profile = action.payload;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            // Update Profile
            .addCase(updateProfile.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateProfile.fulfilled, (state, action: PayloadAction<Profile>) => {
                state.status = 'succeeded';
                state.profile = action.payload;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    },
});

export const { resetProfile } = profileSlice.actions;
export default profileSlice.reducer;
