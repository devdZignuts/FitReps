import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { trainingService, TrainingProgram, TrainingSchedule } from '../../services/training.service';

interface TrainingState {
    activeProgram: TrainingProgram | null;
    todaySchedule: TrainingSchedule | null;
    fullSchedule: TrainingSchedule[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: TrainingState = {
    activeProgram: null,
    todaySchedule: null,
    fullSchedule: [],
    status: 'idle',
    error: null,
};

export const fetchActiveProgram = createAsyncThunk(
    'training/fetchActiveProgram',
    async (_, { rejectWithValue }) => {
        try {
            return await trainingService.getActiveProgram();
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to fetch active program');
        }
    }
);

export const fetchFullSchedule = createAsyncThunk(
    'training/fetchFullSchedule',
    async (_, { rejectWithValue }) => {
        try {
            return await trainingService.getFullSchedule();
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to fetch full schedule');
        }
    }
);

export const fetchTodaySchedule = createAsyncThunk(
    'training/fetchTodaySchedule',
    async (_, { rejectWithValue }) => {
        try {
            return await trainingService.getTodaySchedule();
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to fetch today schedule');
        }
    }
);

export const abortActiveProgram = createAsyncThunk(
    'training/abortActiveProgram',
    async (programId: string, { rejectWithValue }) => {
        try {
            await trainingService.abortProgram(programId);
            return programId;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to abort program');
        }
    }
);

export const createProgram = createAsyncThunk(
    'training/createProgram',
    async (payload: { program: Partial<TrainingProgram>, schedule: Partial<TrainingSchedule>[] }, { dispatch, rejectWithValue }) => {
        try {
            const program = await trainingService.createProgram(payload.program);
            const scheduleItems = payload.schedule.map(item => ({ ...item, program_id: program.id }));
            await trainingService.createScheduleItems(scheduleItems);

            // Refresh today's schedule and full schedule immediately after creation
            dispatch(fetchTodaySchedule());
            dispatch(fetchFullSchedule());

            return program;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to create program');
        }
    }
);

const trainingSlice = createSlice({
    name: 'training',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchActiveProgram.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchActiveProgram.fulfilled, (state, action) => {
                state.activeProgram = action.payload;
                state.status = 'idle';
            })
            .addCase(fetchActiveProgram.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(fetchFullSchedule.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchFullSchedule.fulfilled, (state, action) => {
                state.fullSchedule = action.payload;
                state.status = 'idle';
            })
            .addCase(fetchFullSchedule.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(fetchTodaySchedule.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTodaySchedule.fulfilled, (state, action) => {
                state.todaySchedule = action.payload;
                state.status = 'idle';
            })
            .addCase(fetchTodaySchedule.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(createProgram.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createProgram.fulfilled, (state, action) => {
                state.activeProgram = action.payload;
                state.status = 'succeeded';
            })
            .addCase(createProgram.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(abortActiveProgram.fulfilled, (state) => {
                state.activeProgram = null;
                state.todaySchedule = null;
                state.fullSchedule = [];
                state.status = 'succeeded';
            });
    },
});

export default trainingSlice.reducer;
