import React, { useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, StyleSheet } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchWorkouts, removeWorkout } from '../../store/slices/workoutSlice';
import { fetchFullSchedule } from '../../store/slices/trainingSlice';
import AppHeader from '../../components/layout/AppHeader';
import { useNavigation } from '@react-navigation/native';

export default function WorkoutListScreen() {
    const dispatch = useAppDispatch();
    const navigation = useNavigation<any>();
    const { workouts, status: workoutStatus, error: workoutError } = useAppSelector((state) => state.workout);
    const { fullSchedule, status: trainingStatus, error: trainingError } = useAppSelector((state) => state.training);

    useEffect(() => {
        dispatch(fetchWorkouts());
        dispatch(fetchFullSchedule());
    }, [dispatch]);

    const onRefresh = () => {
        dispatch(fetchWorkouts());
        dispatch(fetchFullSchedule());
    };

    const unifiedList = useMemo(() => {
        const now = new Date();
        const todayStr = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

        let list: any[] = [];
        const loggedMap = new Map();
        workouts.forEach(w => loggedMap.set(w.id, w));

        const matchedLoggedIds = new Set();

        // 1. Process schedule items
        fullSchedule.forEach(item => {
            const isFuture = item.workout_date > todayStr;
            const isToday = item.workout_date === todayStr;
            const hasLogged = !!item.workout_id && loggedMap.has(item.workout_id);

            if (hasLogged) {
                const workout = loggedMap.get(item.workout_id);
                list.push({
                    ...workout,
                    status: 'completed',
                    schedule_type: item.workout_type,
                    official_program_id: item.official_program_id,
                    workout_date: item.workout_date
                });
                matchedLoggedIds.add(item.workout_id);
            } else if (item.workout_type === 'rest') {
                list.push({
                    id: item.id,
                    title: 'Rest Day',
                    workout_date: item.workout_date,
                    status: 'rest',
                    type: 'scheduled'
                });
            } else if (isFuture) {
                list.push({
                    id: item.id,
                    title: `${item.workout_type.toUpperCase()} Day`,
                    workout_date: item.workout_date,
                    status: 'upcoming',
                    type: 'scheduled',
                    focus_type: item.focus_type
                });
            } else if (isToday) {
                list.push({
                    id: item.id,
                    title: `${item.workout_type.toUpperCase()} Day`,
                    workout_date: item.workout_date,
                    status: 'today',
                    type: 'scheduled',
                    focus_type: item.focus_type
                });
            } else {
                list.push({
                    id: item.id,
                    title: `${item.workout_type.toUpperCase()} Day`,
                    workout_date: item.workout_date,
                    status: 'skipped',
                    type: 'scheduled',
                    focus_type: item.focus_type
                });
            }
        });

        // 2. Add manual logged workouts
        workouts.forEach(w => {
            if (!matchedLoggedIds.has(w.id)) {
                list.push({
                    ...w,
                    status: 'completed',
                    type: 'logged_manual'
                });
            }
        });

        // 3. Sort by date ASCENDING (Timeline view)
        return list.sort((a, b) => a.workout_date.localeCompare(b.workout_date));
    }, [workouts, fullSchedule]);

    const handleDelete = (id: string, title: string) => {
        Alert.alert(
            'Delete Workout',
            `Are you sure you want to delete "${title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => dispatch(removeWorkout(id))
                },
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => {
        const isLogged = item.status === 'completed';
        const isRest = item.status === 'rest';
        const isUpcoming = item.status === 'upcoming';
        const isToday = item.status === 'today';
        const isSkipped = item.status === 'skipped';

        return (
            <TouchableOpacity
                onPress={() => {
                    if (isLogged) {
                        navigation.navigate('WorkoutDetail', {
                            workoutId: item.id,
                            title: item.title,
                            date: item.workout_date
                        });
                    } else if (isToday || isSkipped || isUpcoming) {
                        // For upcoming/today/skipped, navigating to detail might start it
                        navigation.navigate('Dashboard');
                    }
                }}
                style={[
                    styles.workoutCard,
                    isRest && styles.restCard,
                    isUpcoming && styles.upcomingCard,
                    isToday && styles.todayCard,
                    isSkipped && styles.skippedCard
                ]}
                disabled={isRest}
            >
                <View style={styles.workoutInfo}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.workoutTitle, (isRest || isUpcoming || isToday || isSkipped) && styles.lightText]}>
                            {item.title}
                        </Text>
                        <View style={[styles.statusBadge, (styles as any)[`status_${item.status}`]]}>
                            <Text style={styles.statusBadgeText}>{item.status.toUpperCase()}</Text>
                        </View>
                    </View>

                    <Text style={[styles.workoutDate, (isRest || isUpcoming || isToday || isSkipped) && styles.mutedText]}>
                        {new Date(item.workout_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </Text>

                    {item.focus_type && (
                        <Text style={styles.focusType}>Focus: {item.focus_type.replace('_', ' ')}</Text>
                    )}

                    {item.note ? (
                        <Text style={styles.workoutNote} numberOfLines={1}>
                            {item.note}
                        </Text>
                    ) : null}
                </View>

                {isLogged && (
                    <TouchableOpacity
                        onPress={() => handleDelete(item.id, item.title)}
                        style={styles.deleteButton}
                    >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    const isLoading = workoutStatus === 'loading' || trainingStatus === 'loading';
    const error = workoutError || trainingError;

    return (
        <View style={styles.container}>
            <AppHeader title="My Workouts" showBack={true} />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>
                    Planned & Logged
                </Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('ProgramBuilder')}
                    style={styles.newButton}
                >
                    <Text style={styles.newButtonText}>+ New Workout</Text>
                </TouchableOpacity>
            </View>

            {isLoading && unifiedList.length === 0 ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#4f46e5" />
                </View>
            ) : (
                <FlatList
                    data={unifiedList}
                    keyExtractor={(item, index) => item.id || index.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>💪</Text>
                            <Text style={styles.emptyTitle}>
                                No workouts yet
                            </Text>
                            <Text style={styles.emptyText}>
                                Start your first one by tapping the "New Workout" button above!
                            </Text>
                        </View>
                    }
                />
            )}

            {error && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{error}</Text>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#475569',
    },
    newButton: {
        backgroundColor: '#4f46e5',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 9999,
    },
    newButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: 24,
    },
    workoutCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    restCard: {
        backgroundColor: '#f1f5f9',
        borderColor: '#e2e8f0',
        opacity: 0.8,
    },
    upcomingCard: {
        backgroundColor: '#4f46e5',
        borderColor: '#4338ca',
    },
    todayCard: {
        backgroundColor: '#10b981',
        borderColor: '#059669',
    },
    skippedCard: {
        backgroundColor: '#f87171',
        borderColor: '#ef4444',
    },
    workoutInfo: {
        flex: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    workoutTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
        flex: 1,
    },
    lightText: {
        color: '#fff',
    },
    workoutDate: {
        color: '#64748b',
        fontSize: 14,
        marginTop: 2,
    },
    mutedText: {
        color: 'rgba(255, 255, 255, 0.8)',
    },
    focusType: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '600',
        marginTop: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginLeft: 8,
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#fff',
    },
    status_completed: {
        backgroundColor: '#4f46e5',
    },
    status_rest: {
        backgroundColor: '#94a3b8',
    },
    status_upcoming: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    status_today: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    status_skipped: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    workoutNote: {
        color: '#94a3b8',
        fontSize: 12,
        marginTop: 4,
        fontStyle: 'italic',
    },
    deleteButton: {
        backgroundColor: '#fef2f2',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    deleteButtonText: {
        color: '#ef4444',
        fontSize: 12,
        fontWeight: '600',
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
        color: '#0f172a',
        marginBottom: 8,
    },
    emptyText: {
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
    },
    errorBanner: {
        backgroundColor: '#ef4444',
        padding: 8,
        alignItems: 'center',
    },
    errorText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
});
