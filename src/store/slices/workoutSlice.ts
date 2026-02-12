
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { workoutService, Workout } from '../../services/workout.service';

interface WorkoutState {
    workouts: Workout[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: WorkoutState = {
    workouts: [],
    status: 'idle',
    error: null,
};

// --- Thunks ---

export const fetchWorkouts = createAsyncThunk(
    'workout/fetchWorkouts',
    async (_, { rejectWithValue }) => {
        try {
            return await workoutService.getUserWorkouts();
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to fetch workouts');
        }
    }
);

export const addWorkout = createAsyncThunk(
    'workout/addWorkout',
    async (workout: Partial<Workout>, { rejectWithValue }) => {
        try {
            return await workoutService.createWorkout(workout);
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to create workout');
        }
    }
);

export const removeWorkout = createAsyncThunk(
    'workout/removeWorkout',
    async (workoutId: string, { rejectWithValue }) => {
        try {
            await workoutService.deleteWorkout(workoutId);
            return workoutId;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to delete workout');
        }
    }
);

// --- Slice ---

const workoutSlice = createSlice({
    name: 'workout',
    initialState,
    reducers: {
        clearWorkoutError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch
        builder
            .addCase(fetchWorkouts.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchWorkouts.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.workouts = action.payload;
            })
            .addCase(fetchWorkouts.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Add
        builder
            .addCase(addWorkout.fulfilled, (state, action) => {
                state.workouts.unshift(action.payload);
            })
            .addCase(addWorkout.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        // Remove
        builder
            .addCase(removeWorkout.fulfilled, (state, action) => {
                state.workouts = state.workouts.filter(w => w.id !== action.payload);
            })
            .addCase(removeWorkout.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});

export const { clearWorkoutError } = workoutSlice.actions;
export default workoutSlice.reducer;
