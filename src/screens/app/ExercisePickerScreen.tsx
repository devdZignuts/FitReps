import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import AppHeader from '../../components/layout/AppHeader';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { useNavigation, useRoute } from '@react-navigation/native';
import { EXERCISES_BY_MUSCLE } from '../../constants/exercisesByMuscle';
import { useAppDispatch } from '../../store';
import { addExercise } from '../../store/slices/exerciseSlice';

export default function ExercisePickerScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const dispatch = useAppDispatch();
    const { workoutId, selectedMuscleIds } = route.params;

    const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const availableExercises = selectedMuscleIds.flatMap((muscleId: string) => {
        const exercises = EXERCISES_BY_MUSCLE[muscleId] || [];
        return exercises.map(name => ({
            id: `${muscleId}-${name}`,
            name,
            muscle: muscleId
        }));
    });

    const toggleExercise = (name: string) => {
        setSelectedExercises(prev =>
            prev.includes(name) ? prev.filter(e => e !== name) : [...prev, name]
        );
    };

    const handleAddExercises = async () => {
        if (selectedExercises.length === 0) return;

        setIsSubmitting(true);
        try {
            for (const exerciseName of selectedExercises) {
                await dispatch(addExercise({ workoutId, name: exerciseName })).unwrap();
            }
            navigation.navigate('WorkoutDetail', { workoutId });
        } catch (err: any) {
            Alert.alert('Error', err || 'Failed to add exercises');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const isSelected = selectedExercises.includes(item.name);
        return (
            <TouchableOpacity
                onPress={() => toggleExercise(item.name)}
                style={[
                    styles.itemContainer,
                    isSelected ? styles.itemSelected : styles.itemUnselected
                ]}
            >
                <View>
                    <Text style={[
                        styles.itemName,
                        isSelected ? styles.itemTextSelected : styles.itemTextUnselected
                    ]}>
                        {item.name}
                    </Text>
                    <Text style={styles.itemMuscle}>
                        {item.muscle.replace('_', ' ')}
                    </Text>
                </View>
                <View style={[
                    styles.checkCircle,
                    isSelected ? styles.checkCircleSelected : styles.checkCircleUnselected
                ]}>
                    {isSelected && <Text style={styles.checkText}>✓</Text>}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <AppHeader title="Select Exercises" showProfile={false} showBack={true} />

            <View style={styles.headerBox}>
                <Text style={styles.title}>Recommended Exercises</Text>
                <Text style={styles.subtitle}>Select the moves for your session</Text>
            </View>

            {isSubmitting ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#4f46e5" />
                    <Text style={styles.loaderText}>Adding to workout...</Text>
                </View>
            ) : (
                <>
                    <FlatList
                        data={availableExercises}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No exercises found for selection</Text>
                            </View>
                        }
                    />

                    <View style={styles.footer}>
                        <Text style={styles.footerStats}>
                            {selectedExercises.length} Exercises Selected
                        </Text>
                        <PrimaryButton
                            title="Add to Workout"
                            onPress={handleAddExercises}
                            disabled={selectedExercises.length === 0}
                        />
                    </View>
                </>
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
        paddingHorizontal: 24,
        paddingVertical: 24,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    subtitle: {
        color: '#64748b',
        marginTop: 4,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderText: {
        color: '#64748b',
        marginTop: 16,
        fontWeight: '500',
    },
    listContent: {
        paddingVertical: 20,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 80,
    },
    emptyText: {
        color: '#94a3b8',
    },
    itemContainer: {
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemUnselected: {
        backgroundColor: '#fff',
        borderColor: '#f1f5f9',
    },
    itemSelected: {
        backgroundColor: '#eef2ff',
        borderColor: '#c7d2fe',
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    itemTextUnselected: {
        color: '#0f172a',
    },
    itemTextSelected: {
        color: '#312e81',
    },
    itemMuscle: {
        color: '#94a3b8',
        fontSize: 12,
        textTransform: 'uppercase',
        fontWeight: '600',
        marginTop: 4,
    },
    checkCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkCircleUnselected: {
        borderColor: '#e2e8f0',
    },
    checkCircleSelected: {
        backgroundColor: '#4f46e5',
        borderColor: 'transparent',
    },
    checkText: {
        color: '#fff',
        fontSize: 12,
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        backgroundColor: '#fff',
    },
    footerStats: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 16,
        textTransform: 'uppercase',
        textAlign: 'center',
        letterSpacing: 1,
    }
});
