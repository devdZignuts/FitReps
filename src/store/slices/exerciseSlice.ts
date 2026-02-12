import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { exerciseService, Exercise } from '../../services/exercise.service';

interface ExerciseState {
    exercises: Exercise[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: ExerciseState = {
    exercises: [],
    status: 'idle',
    error: null,
};

export const fetchExercises = createAsyncThunk(
    'exercise/fetchExercises',
    async (workoutId: string, { rejectWithValue }) => {
        try {
            return await exerciseService.getExercises(workoutId);
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to fetch exercises');
        }
    }
);

export const addExercise = createAsyncThunk(
    'exercise/addExercise',
    async ({ workoutId, name }: { workoutId: string; name: string }, { rejectWithValue }) => {
        try {
            return await exerciseService.createExercise(workoutId, name);
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to add exercise');
        }
    }
);

export const removeExercise = createAsyncThunk(
    'exercise/removeExercise',
    async (id: string, { rejectWithValue }) => {
        try {
            await exerciseService.deleteExercise(id);
            return id;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to remove exercise');
        }
    }
);

const exerciseSlice = createSlice({
    name: 'exercise',
    initialState,
    reducers: {
        clearExercises: (state) => {
            state.exercises = [];
            state.status = 'idle';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchExercises.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchExercises.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.exercises = action.payload;
            })
            .addCase(fetchExercises.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(addExercise.fulfilled, (state, action) => {
                state.exercises.push(action.payload);
            })
            .addCase(removeExercise.fulfilled, (state, action) => {
                state.exercises = state.exercises.filter((e) => e.id !== action.payload);
            });
    },
});

export const { clearExercises } = exerciseSlice.actions;
export default exerciseSlice.reducer;
