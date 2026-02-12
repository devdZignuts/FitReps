import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { weightService, BodyWeightLog } from '../../services/weight.service';

interface WeightState {
    logs: BodyWeightLog[];
    latestLog: BodyWeightLog | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: WeightState = {
    logs: [],
    latestLog: null,
    status: 'idle',
    error: null,
};

export const fetchWeightLogs = createAsyncThunk(
    'weight/fetchLogs',
    async (_, { rejectWithValue }) => {
        try {
            return await weightService.getWeightLogs();
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to fetch weight logs');
        }
    }
);

export const logBodyWeight = createAsyncThunk(
    'weight/logWeight',
    async ({ weightKg, date }: { weightKg: number; date?: string }, { rejectWithValue }) => {
        try {
            return await weightService.logWeight(weightKg, date);
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to log weight');
        }
    }
);

export const fetchLatestWeight = createAsyncThunk(
    'weight/fetchLatest',
    async (_, { rejectWithValue }) => {
        try {
            return await weightService.getLatestWeight();
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to fetch latest weight');
        }
    }
);

const weightSlice = createSlice({
    name: 'weight',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchWeightLogs.fulfilled, (state, action) => {
                state.logs = action.payload;
                state.status = 'succeeded';
            })
            .addCase(fetchLatestWeight.fulfilled, (state, action) => {
                state.latestLog = action.payload;
            })
            .addCase(logBodyWeight.fulfilled, (state, action) => {
                state.latestLog = action.payload;
                const index = state.logs.findIndex(l => l.date === action.payload.date);
                if (index !== -1) {
                    state.logs[index] = action.payload;
                } else {
                    state.logs.unshift(action.payload);
                    state.logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                }
            });
    },
});

export default weightSlice.reducer;
