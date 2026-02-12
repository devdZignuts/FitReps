
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import authReducer from './slices/authSlice';
import workoutReducer from './slices/workoutSlice';
import exerciseReducer from './slices/exerciseSlice';
import setReducer from './slices/setSlice';
import weightReducer from './slices/weightSlice';
import trainingReducer from './slices/trainingSlice';
import profileReducer from './slices/profileSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        workout: workoutReducer,
        exercise: exerciseReducer,
        set: setReducer,
        weight: weightReducer,
        training: trainingReducer,
        profile: profileReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // supabase objects are not serializable
        }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
