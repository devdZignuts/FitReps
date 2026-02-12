import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../store';
import AppHeader from '../../components/layout/AppHeader';
import { OFFICIAL_PROGRAMS } from '../../constants/officialPrograms';
import { addWorkout } from '../../store/slices/workoutSlice';
import { ActivityIndicator } from 'react-native';

export default function ProgramWorkoutsScreen() {
    const navigation = useNavigation<any>();
    const dispatch = useAppDispatch();
    const { activeProgram } = useAppSelector((state) => state.training);
    const [isCreating, setIsCreating] = React.useState(false);

    // Get the official program details based on the active program
    const officialProgram = useMemo(() => {
        if (!activeProgram) return null;
        // Attempt to find by ID first, then by matching name if needed
        // Assuming activeProgram.name might match one of the official ones or we stored the ID somewhere
        // For now, let's try to match by name as a fallback or assume we might need to store official_program_id on activeProgram
        return OFFICIAL_PROGRAMS.find(p => p.name === activeProgram.name) || OFFICIAL_PROGRAMS.find(p => activeProgram.name.includes(p.name));
    }, [activeProgram]);

    const workouts = useMemo(() => {
        if (!officialProgram) return [];
        return Object.values(officialProgram.workouts);
    }, [officialProgram]);

    const handleSelectWorkout = async (workoutDef: any) => {
        setIsCreating(true);
        try {
            const now = new Date();
            const todayDateString = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

            // Create a new workout entry
            const result = await dispatch(addWorkout({
                title: workoutDef.name,
                workout_date: todayDateString,
                note: `Manual log from ${officialProgram?.name}`
            })).unwrap();

            // Navigate to detail screen with the params to trigger auto-generation
            navigation.replace('WorkoutDetail', {
                workoutId: result.id,
                title: workoutDef.name,
                date: todayDateString,
                officialProgramId: officialProgram?.id,
                officialWorkoutId: workoutDef.id
            });
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create workout');
            setIsCreating(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => handleSelectWorkout(item)}
            disabled={isCreating}
        >
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardFocus}>Focus: {item.focus.replace(/_/g, ' ')}</Text>
                <Text style={styles.cardExercises}>
                    {item.exercises.length} Exercises • {item.exercises.map((e: any) => e.name).slice(0, 3).join(', ')}...
                </Text>
            </View>
            <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <AppHeader title="Select Routine" showBack={true} />

            {isCreating && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#4f46e5" />
                </View>
            )}

            {!activeProgram ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyText}>No active program found.</Text>
                </View>
            ) : !officialProgram ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyText}>
                        Current program "{activeProgram.name}" is not a recognized official routine template.
                        You can log a custom workout instead.
                    </Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate('AddWorkout')}
                    >
                        <Text style={styles.buttonText}>Log Custom Workout</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={workouts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={
                        <Text style={styles.headerText}>
                            Choose a routine from {officialProgram.name}
                        </Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    listContent: {
        padding: 16,
    },
    headerText: {
        fontSize: 16,
        color: '#64748b',
        marginBottom: 16,
        marginLeft: 4,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    cardContent: {
        flex: 1,
        marginRight: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 4,
    },
    cardFocus: {
        fontSize: 14,
        color: '#4f46e5',
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'capitalize',
    },
    cardExercises: {
        fontSize: 12,
        color: '#94a3b8',
        lineHeight: 18,
    },
    arrow: {
        fontSize: 24,
        color: '#cbd5e1',
        fontWeight: 'bold',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 24,
    },
    button: {
        backgroundColor: '#4f46e5',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.7)',
        zIndex: 10,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
