import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, ScrollView, TextInput } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchExercises, removeExercise, addExercise } from '../../store/slices/exerciseSlice';
import { fetchSets, removeSet, addSet, updateSet, fetchLastSet } from '../../store/slices/setSlice';
import AppHeader from '../../components/layout/AppHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { WorkoutTemplate, WORKOUT_TEMPLATES } from '../../constants/workoutTemplates';
import { RotationService } from '../../services/rotation.service';
import { OFFICIAL_PROGRAMS } from '../../constants/officialPrograms';

export default function WorkoutDetailScreen() {
    const dispatch = useAppDispatch();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { workoutId, title, date, selectedTemplates, focusType, officialProgramId, officialWorkoutId } = route.params;

    const { exercises, status: exStatus } = useAppSelector((state) => state.exercise);
    const { sets, status: setStatus } = useAppSelector((state) => state.set);

    const [expandedExercises, setExpandedExercises] = useState<{ [id: string]: boolean }>({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [newItemInputs, setNewItemInputs] = useState<{ [exerciseId: string]: { reps: string, weight: string } }>({});
    const [lastSets, setLastSets] = useState<{ [name: string]: { weight: number, reps: number } | null }>({});

    // Helper to fetch last set
    const loadLastSet = async (exerciseName: string) => {
        try {
            const result = await dispatch(fetchLastSet(exerciseName)).unwrap();
            if (result && result.data) {
                const data = result.data;
                setLastSets(prev => ({ ...prev, [exerciseName]: { weight: data.weight, reps: data.reps } }));
            }
        } catch (e) {
            // silent fail for history
        }
    };

    useEffect(() => {
        dispatch(fetchExercises(workoutId));
    }, [dispatch, workoutId]);

    // Load history for existing exercises and auto-expand first one
    useEffect(() => {
        if (exercises.length > 0) {
            exercises.forEach(ex => {
                if (!lastSets[ex.name]) {
                    loadLastSet(ex.name);
                }
            });

            // Auto-expand the first exercise if nothing is expanded yet
            if (Object.keys(expandedExercises).length === 0) {
                setExpandedExercises({ [exercises[0].id]: true });
                // Also fetch sets for it immediately
                dispatch(fetchSets(exercises[0].id));
            }
        }
    }, [exercises]);

    useEffect(() => {
        if (officialProgramId && officialWorkoutId && exercises.length === 0) {
            generateOfficialExercises();
        } else if (selectedTemplates && selectedTemplates.length > 0 && exercises.length === 0) {
            generateExercisesFromTemplates(selectedTemplates);
        }
    }, [selectedTemplates, officialProgramId, officialWorkoutId, exercises.length]);

    const generateOfficialExercises = async () => {
        setIsGenerating(true);
        try {
            const program = OFFICIAL_PROGRAMS.find(p => p.id === officialProgramId);
            const workout = program?.workouts[officialWorkoutId];
            if (!workout) return;

            for (const exTemplate of workout.exercises) {
                // Check if already exists to avoid duplicates (safeguard)
                const exists = exercises.find(e => e.name === exTemplate.name);
                if (exists) continue;

                const createdExercise = await dispatch(addExercise({
                    workoutId,
                    name: exTemplate.name,
                })).unwrap();

                // Fetch history comfortably in background
                loadLastSet(exTemplate.name);

                const reps = parseInt(exTemplate.reps.split('-')[0]) || 10;
                for (let i = 0; i < exTemplate.sets; i++) {
                    await dispatch(addSet({
                        exerciseId: createdExercise.id,
                        reps: reps,
                        weight: 0,
                    })).unwrap();
                }
            }
            // re-fetch to sync state
            dispatch(fetchExercises(workoutId));
        } catch (error: any) {
            Alert.alert('Error', error || 'Failed to generate exercises');
        } finally {
            setIsGenerating(false);
        }
    };

    const generateExercisesFromTemplates = async (templates: WorkoutTemplate[]) => {
        setIsGenerating(true);
        try {
            for (const template of templates) {
                const exercisesToGenerate = focusType
                    ? RotationService.getExercisesByFocus(template.id, focusType)
                    : template.exercises;

                for (const exerciseTemplate of exercisesToGenerate) {
                    // Check if already exists
                    const exists = exercises.find(e => e.name === exerciseTemplate.name);
                    if (exists) continue;

                    const createdExercise = await dispatch(addExercise({
                        workoutId,
                        name: exerciseTemplate.name,
                    })).unwrap();

                    loadLastSet(exerciseTemplate.name);

                    if (exerciseTemplate.defaultSets && exerciseTemplate.defaultSets.length > 0) {
                        for (const defaultSet of exerciseTemplate.defaultSets) {
                            await dispatch(addSet({
                                exerciseId: createdExercise.id,
                                reps: defaultSet.reps,
                                weight: defaultSet.weight || 0,
                            })).unwrap();
                        }
                    }
                }
            }
            dispatch(fetchExercises(workoutId));
        } catch (error: any) {
            Alert.alert('Error', error || 'Failed to generate exercises');
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleExercise = (exerciseId: string) => {
        setExpandedExercises(prev => ({
            ...prev,
            [exerciseId]: !prev[exerciseId]
        }));

        if (!sets[exerciseId]) {
            dispatch(fetchSets(exerciseId));
        }
    };

    const handleDeleteExercise = (id: string, name: string) => {
        Alert.alert(
            'Delete Exercise',
            `Are you sure you want to delete "${name}" and all its sets?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => dispatch(removeExercise(id)) },
            ]
        );
    };

    const handleDeleteSet = (setId: string, exerciseId: string) => {
        dispatch(removeSet({ id: setId, exerciseId }));
    };

    const handleUpdateSet = (setId: string, exerciseId: string, reps: string, weight: string) => {
        const r = parseInt(reps);
        const w = parseFloat(weight);
        if (!isNaN(r) && !isNaN(w)) {
            dispatch(updateSet({ id: setId, exerciseId, reps: r, weight: w }));
        }
    };

    const handleAddSetInline = (exerciseId: string) => {
        const input = newItemInputs[exerciseId];
        if (!input) return;

        const reps = parseInt(input.reps);
        const weight = parseFloat(input.weight);

        if (isNaN(reps) || isNaN(weight)) {
            Alert.alert('Invalid Input', 'Please enter valid numbers for reps and weight.');
            return;
        }

        dispatch(addSet({ exerciseId, reps, weight }));

        // Reset inputs
        setNewItemInputs(prev => ({
            ...prev,
            [exerciseId]: { reps: '', weight: '' }
        }));
    };

    const calculate1RM = (reps: number, weight: number) => {
        if (reps > 10 || reps <= 0) return null;
        return (weight * (1 + reps / 30)).toFixed(1);
    };

    const getMax1RM = (exerciseId: string) => {
        const exerciseSets = sets[exerciseId] || [];
        const estimates = exerciseSets
            .map(s => {
                const val = calculate1RM(s.reps, s.weight);
                return val ? parseFloat(val) : 0;
            })
            .filter(v => v > 0);

        if (estimates.length === 0) return null;
        return Math.max(...estimates).toFixed(1);
    };

    const handleFinishWorkout = () => {
        Alert.alert(
            'Finish Workout',
            'Are you done with your session?',
            [
                { text: 'Keep Logging', style: 'cancel' },
                {
                    text: 'Finish',
                    style: 'default',
                    onPress: () => navigation.navigate('Dashboard')
                },
            ]
        );
    };

    const renderSetItem = (set: any, exerciseId: string) => (
        <TouchableOpacity
            key={set.id}
            style={styles.setItem}
            onLongPress={() => handleDeleteSet(set.id, exerciseId)}
        >
            <View style={styles.inlineInputs}>
                <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Reps</Text>
                    <TextInput
                        style={styles.inlineInput}
                        keyboardType="numeric"
                        defaultValue={set.reps.toString()}
                        onEndEditing={(e) => handleUpdateSet(set.id, exerciseId, e.nativeEvent.text, set.weight.toString())}
                    />
                </View>
                <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Weight (kg)</Text>
                    <TextInput
                        style={styles.inlineInput}
                        keyboardType="numeric"
                        defaultValue={set.weight.toString()}
                        onEndEditing={(e) => handleUpdateSet(set.id, exerciseId, set.reps.toString(), e.nativeEvent.text)}
                    />
                </View>
                {calculate1RM(set.reps, set.weight) && (
                    <View style={styles.rmBadge}>
                        <Text style={styles.rmText}>1RM: {calculate1RM(set.reps, set.weight)}kg</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderExerciseItem = ({ item }: { item: any }) => {
        const max1RM = getMax1RM(item.id);
        const lastSet = lastSets[item.name];
        const inputs = newItemInputs[item.id] || { reps: '', weight: '' };

        return (
            <View style={styles.exerciseCard}>
                <TouchableOpacity
                    onPress={() => toggleExercise(item.id)}
                    style={styles.exerciseHeader}
                >
                    <View style={{ flex: 1 }}>
                        <Text style={styles.exerciseTitle}>{item.name}</Text>
                        <View style={styles.exerciseMeta}>
                            <Text style={styles.exerciseSubtitle}>
                                {sets[item.id]?.length || 0} Sets
                            </Text>
                            {lastSet && (
                                <Text style={styles.historyText}>
                                    • Last: {lastSet.weight}kg x {lastSet.reps}
                                </Text>
                            )}
                            {max1RM && (
                                <Text style={styles.maxRMText}>
                                    • Est. 1RM: {max1RM}kg
                                </Text>
                            )}
                        </View>
                    </View>
                    <View style={styles.exerciseActions}>
                        <TouchableOpacity
                            onPress={() => handleDeleteExercise(item.id, item.name)}
                            style={{ marginRight: 16 }}
                        >
                            <Text style={styles.deleteButtonText}>Delete</Text>
                        </TouchableOpacity>
                        <Text style={styles.expandIcon}>
                            {expandedExercises[item.id] ? '−' : '+'}
                        </Text>
                    </View>
                </TouchableOpacity>

                {expandedExercises[item.id] && (
                    <View style={styles.setsContainer}>
                        {sets[item.id]?.map((set: any) => renderSetItem(set, item.id))}

                        <View style={styles.addItemRow}>
                            <TextInput
                                style={styles.addRowInput}
                                placeholder="Reps"
                                keyboardType="numeric"
                                value={inputs.reps}
                                onChangeText={(text) => setNewItemInputs(prev => ({
                                    ...prev,
                                    [item.id]: { ...inputs, reps: text }
                                }))}
                            />
                            <TextInput
                                style={styles.addRowInput}
                                placeholder="Weight"
                                keyboardType="numeric"
                                value={inputs.weight}
                                onChangeText={(text) => setNewItemInputs(prev => ({
                                    ...prev,
                                    [item.id]: { ...inputs, weight: text }
                                }))}
                            />
                            <TouchableOpacity
                                onPress={() => handleAddSetInline(item.id)}
                                style={styles.inlineAddButton}
                            >
                                <Text style={styles.inlineAddButtonText}>+ Add Set</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <AppHeader title="Workout Details" showProfile={false} showBack={true} />

            <View style={styles.headerBox}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>
                    {new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Exercises</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('MuscleSelect', { workoutId })}
                        style={styles.buildButton}
                    >
                        <Text style={styles.buildButtonText}>✨ Build</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('AddExercise', { workoutId })}
                        style={styles.addButton}
                    >
                        <Text style={styles.addButtonText}>+ Add</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {exStatus === 'loading' && exercises.length === 0 ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#4f46e5" />
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    <FlatList
                        data={exercises}
                        keyExtractor={(item) => item.id}
                        renderItem={renderExerciseItem}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyIcon}>🏋️‍♂️</Text>
                                <Text style={styles.emptyTitle}>No exercises added</Text>
                                <Text style={styles.emptyText}>Add your first exercise to start logging your progress!</Text>
                            </View>
                        }
                    />

                    {exercises.length > 0 && (
                        <View style={styles.footerContainer}>
                            <PrimaryButton
                                title="Finish Workout"
                                onPress={handleFinishWorkout}
                                style={styles.finishButton}
                            />
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    headerBox: {
        padding: 24,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#475569',
    },
    buildButton: {
        backgroundColor: '#10b981',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 9999,
        marginRight: 8,
    },
    buildButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: '#4f46e5',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 9999,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    exerciseCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        overflow: 'hidden',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    exerciseHeader: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    exerciseTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    exerciseMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    exerciseSubtitle: {
        fontSize: 12,
        color: '#64748b',
    },
    maxRMText: {
        fontSize: 12,
        color: '#10b981',
        fontWeight: '700',
        marginLeft: 12,
    },
    historyText: {
        fontSize: 12,
        color: '#64748b',
        marginLeft: 8,
    },
    exerciseActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#94a3b8',
        fontSize: 12,
    },
    expandIcon: {
        color: '#4f46e5',
        fontWeight: 'bold',
        fontSize: 18,
    },
    setsContainer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#f8fafc',
        backgroundColor: '#fcfdfe',
    },
    setItem: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    inlineInputs: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputWrapper: {
        flex: 1,
        marginRight: 12,
    },
    inputLabel: {
        fontSize: 10,
        color: '#94a3b8',
        marginBottom: 2,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    inlineInput: {
        fontSize: 16,
        color: '#1e293b',
        fontWeight: '700',
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    rmBadge: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    rmText: {
        fontSize: 10,
        color: '#64748b',
        fontWeight: 'bold',
    },
    addItemRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    addRowInput: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 8,
        fontSize: 14,
    },
    inlineAddButton: {
        backgroundColor: '#4f46e5',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        justifyContent: 'center',
    },
    inlineAddButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 80,
        paddingHorizontal: 40,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    emptyText: {
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
    },
    footerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    finishButton: {
        backgroundColor: '#0f172a',
    },
});
