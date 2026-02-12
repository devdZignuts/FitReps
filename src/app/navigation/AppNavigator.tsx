import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../../screens/app/DashboardScreen';
import WorkoutListScreen from '../../screens/app/WorkoutListScreen';
import AddWorkoutScreen from '../../screens/app/AddWorkoutScreen';
import WorkoutDetailScreen from '../../screens/app/WorkoutDetailScreen';
import AddExerciseScreen from '../../screens/app/AddExerciseScreen';
import AddSetScreen from '../../screens/app/AddSetScreen';

import MuscleSelectScreen from '../../screens/app/MuscleSelectScreen';
import ExercisePickerScreen from '../../screens/app/ExercisePickerScreen';
import TemplateSelectScreen from '../../screens/app/TemplateSelectScreen';
import WeightHistoryScreen from '../../screens/app/WeightHistoryScreen';
import ProgramBuilderScreen from '../../screens/app/ProgramBuilderScreen';
import CustomWeeklyBuilderScreen from '../../screens/app/CustomWeeklyBuilderScreen';
import ProgramWorkoutsScreen from '../../screens/app/ProgramWorkoutsScreen';
import OnboardingScreen from '../../screens/auth/OnboardingScreen';
import ProfileScreen from '../../screens/app/ProfileScreen';
import { useAppSelector } from '../../store';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
    const { profile } = useAppSelector((state) => state.profile);
    const isOnboarded = profile?.is_onboarded;

    return (
        <Stack.Navigator
            initialRouteName={isOnboarded ? "Dashboard" : "Onboarding"}
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right'
            }}
        >
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="WorkoutList" component={WorkoutListScreen} />
            <Stack.Screen name="AddWorkout" component={AddWorkoutScreen} />
            <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
            <Stack.Screen name="AddExercise" component={AddExerciseScreen} />
            <Stack.Screen name="AddSet" component={AddSetScreen} />
            <Stack.Screen name="MuscleSelect" component={MuscleSelectScreen} />
            <Stack.Screen name="ExercisePicker" component={ExercisePickerScreen} />
            <Stack.Screen name="TemplateSelect" component={TemplateSelectScreen} />
            <Stack.Screen name="WeightHistory" component={WeightHistoryScreen} />
            <Stack.Screen name="ProgramBuilder" component={ProgramBuilderScreen} />
            <Stack.Screen name="CustomWeeklyBuilder" component={CustomWeeklyBuilderScreen} />
            <Stack.Screen name="ProgramWorkouts" component={ProgramWorkoutsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
    );
};

export default AppNavigator;
