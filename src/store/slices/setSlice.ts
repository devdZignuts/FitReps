import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { setService, Set } from '../../services/set.service';

interface SetState {
    sets: { [exerciseId: string]: Set[] };
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: SetState = {
    sets: {},
    status: 'idle',
    error: null,
};

export const fetchSets = createAsyncThunk(
    'set/fetchSets',
    async (exerciseId: string, { rejectWithValue }) => {
        try {
            const data = await setService.getSets(exerciseId);
            return { exerciseId, data };
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to fetch sets');
        }
    }
);

export const addSet = createAsyncThunk(
    'set/addSet',
    async ({ exerciseId, reps, weight }: { exerciseId: string; reps: number; weight: number }, { rejectWithValue }) => {
        try {
            return await setService.createSet(exerciseId, reps, weight);
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to add set');
        }
    }
);

export const removeSet = createAsyncThunk(
    'set/removeSet',
    async ({ id, exerciseId }: { id: string; exerciseId: string }, { rejectWithValue }) => {
        try {
            await setService.deleteSet(id);
            return { id, exerciseId };
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to remove set');
        }
    }
);

export const updateSet = createAsyncThunk(
    'set/updateSet',
    async ({ id, reps, weight, exerciseId }: { id: string; reps: number; weight: number; exerciseId: string }, { rejectWithValue }) => {
        try {
            const data = await setService.updateSet(id, reps, weight);
            return { exerciseId, data };
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to update set');
        }
    }
);

export const fetchLastSet = createAsyncThunk(
    'set/fetchLastSet',
    async (exerciseName: string, { rejectWithValue }) => {
        try {
            const data = await setService.getLastPerformedSet(exerciseName);
            return { exerciseName, data };
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to fetch last set');
        }
    }
);

const setSlice = createSlice({
    name: 'set',
    initialState,
    reducers: {
        clearSets: (state) => {
            state.sets = {};
            state.status = 'idle';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSets.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchSets.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.sets[action.payload.exerciseId] = action.payload.data;
            })
            .addCase(fetchSets.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(addSet.fulfilled, (state, action) => {
                const exerciseId = action.payload.exercise_id;
                if (!state.sets[exerciseId]) {
                    state.sets[exerciseId] = [];
                }
                state.sets[exerciseId].push(action.payload);
            })
            .addCase(removeSet.fulfilled, (state, action) => {
                const { id, exerciseId } = action.payload;
                if (state.sets[exerciseId]) {
                    state.sets[exerciseId] = state.sets[exerciseId].filter((s) => s.id !== id);
                }
            })
            .addCase(updateSet.fulfilled, (state, action) => {
                const { exerciseId, data } = action.payload;
                if (state.sets[exerciseId]) {
                    const index = state.sets[exerciseId].findIndex(s => s.id === data.id);
                    if (index !== -1) {
                        state.sets[exerciseId][index] = data;
                    }
                }
            });
    },
});

export const { clearSets } = setSlice.actions;
export default setSlice.reducer;
