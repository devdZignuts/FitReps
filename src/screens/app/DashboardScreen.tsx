import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, Animated, Easing, Dimensions } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store';
import { logBodyWeight, fetchLatestWeight } from '../../store/slices/weightSlice';
import { fetchTodaySchedule, fetchActiveProgram, abortActiveProgram, fetchFullSchedule } from '../../store/slices/trainingSlice';
import { addWorkout } from '../../store/slices/workoutSlice';
import AppHeader from '../../components/layout/AppHeader';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { WORKOUT_TEMPLATES } from '../../constants/workoutTemplates';
import { OFFICIAL_PROGRAMS } from '../../constants/officialPrograms';

export default function DashboardScreen() {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { latestLog } = useAppSelector((state) => state.weight);
    const { todaySchedule, activeProgram, status, fullSchedule } = useAppSelector((state) => state.training);
    const navigation = useNavigation<any>();

    const [weight, setWeight] = useState('');
    const [isLogging, setIsLogging] = useState(false);
    const [isStartingWorkout, setIsStartingWorkout] = useState(false);
    const [isCreatingManual, setIsCreatingManual] = useState(false);

    // Animation for Play Button
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, [pulseAnim]);

    useFocusEffect(
        useCallback(() => {
            dispatch(fetchLatestWeight());
            dispatch(fetchActiveProgram());
            dispatch(fetchTodaySchedule());
            dispatch(fetchFullSchedule()); // Ensure we have the full schedule for lookahead
        }, [dispatch])
    );

    // ... (keep handleLogWeight)

    const handleManualLog = async () => {
        if (!activeProgram) return;
        setIsCreatingManual(true);
        try {
            const todayStr = new Date().toISOString().split('T')[0];

            // 1. Find the NEXT scheduled non-rest workout
            const upcomingWorkouts = fullSchedule
                .filter(s => s.workout_type !== 'rest' && s.workout_date >= todayStr)
                .sort((a, b) => a.workout_date.localeCompare(b.workout_date));

            const targetItem = upcomingWorkouts.length > 0 ? upcomingWorkouts[0] : null;

            // 2. Identify the official program structure
            // Try matching by ID from schedule first, then by name
            const officialProgram = (targetItem?.official_program_id ? OFFICIAL_PROGRAMS.find(p => p.id === targetItem.official_program_id) : null)
                || OFFICIAL_PROGRAMS.find(p => p.name === activeProgram.name || activeProgram.name.includes(p.name));

            let title = '';
            let targetWorkoutType = targetItem?.workout_type;
            let offProgId = targetItem?.official_program_id || officialProgram?.id;
            let offWorkId = targetItem?.official_workout_id;

            if (officialProgram) {
                // If we didn't find a target item, default to first day of this official program
                if (!targetWorkoutType) {
                    const firstDay = officialProgram.schedule[0];
                    targetWorkoutType = firstDay !== 'rest' ? firstDay : 'push_1';
                }
                const workoutDef = officialProgram.workouts[targetWorkoutType];
                title = workoutDef?.name || targetWorkoutType.toUpperCase().replace('_', ' ');
                offWorkId = offWorkId || workoutDef?.id;
            } else {
                // Not an official program or nothing found, use the schedule type or generic title
                title = targetWorkoutType
                    ? targetWorkoutType.toUpperCase().replace('_', ' ')
                    : 'Manual Workout';
            }

            // 3. Create the workout
            const result = await dispatch(addWorkout({
                title: title,
                workout_date: todayStr,
                note: `Direct log - ${title}`
            })).unwrap();

            // 4. Navigate directly to Detail with all metadata
            navigation.navigate('WorkoutDetail', {
                workoutId: result.id,
                title: title,
                date: todayStr,
                officialProgramId: offProgId,
                officialWorkoutId: offWorkId,
                selectedTemplates: !offWorkId ? WORKOUT_TEMPLATES.filter(t => t.id === targetWorkoutType || targetWorkoutType?.includes(t.id)) : []
            });

        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to start manual workout');
        } finally {
            setIsCreatingManual(false);
        }
    };

    useEffect(() => {
        if (latestLog) {
            setWeight(latestLog.weight_kg.toString());
        }
    }, [latestLog]);

    const handleLogWeight = async () => {
        const weightNum = parseFloat(weight);
        if (isNaN(weightNum)) {
            Alert.alert('Invalid Weight', 'Please enter a valid number.');
            return;
        }

        setIsLogging(true);
        try {
            await dispatch(logBodyWeight({ weightKg: weightNum })).unwrap();
            Alert.alert('Success', 'Body weight logged successfully!');
        } catch (err: any) {
            Alert.alert('Error', err || 'Failed to log weight');
        } finally {
            setIsLogging(false);
        }
    };

    const handleStartTodayWorkout = async () => {
        if (!todaySchedule || !activeProgram) return;

        // If it's a rest day, use the "Lookahead" logic to find the next meaningful workout
        if (todaySchedule.workout_type === 'rest') {
            await handleManualLog();
            return;
        }

        setIsStartingWorkout(true);
        try {
            if (todaySchedule.workout_id) {
                navigation.navigate('WorkoutDetail', {
                    workoutId: todaySchedule.workout_id,
                    title: `${todaySchedule.workout_type.toUpperCase().replace('_', ' ')} Day`,
                    date: todaySchedule.workout_date
                });
                return;
            }

            // Try to find official name for better title and metadata
            const officialProgram = todaySchedule.official_program_id
                ? OFFICIAL_PROGRAMS.find(p => p.id === todaySchedule.official_program_id)
                : OFFICIAL_PROGRAMS.find(p => p.name === activeProgram.name || activeProgram.name.includes(p.name));

            const workoutDef = officialProgram?.workouts[todaySchedule.workout_type];
            const template = WORKOUT_TEMPLATES.find(t => t.id === todaySchedule.workout_type || todaySchedule.workout_type.startsWith(t.id));

            const focusTitle = todaySchedule.focus_type
                ? `${todaySchedule.focus_type.replace('_', ' ').toUpperCase()}`
                : '';

            const title = workoutDef?.name
                || (template ? `${template.name}${focusTitle ? ` - ${focusTitle}` : ''}` : `${todaySchedule.workout_type.toUpperCase().replace('_', ' ')} Day`);

            const result = await dispatch(addWorkout({
                title,
                workout_date: todaySchedule.workout_date
            })).unwrap();

            navigation.navigate('WorkoutDetail', {
                workoutId: result.id,
                title,
                date: todaySchedule.workout_date,
                selectedTemplates: !workoutDef && template ? [template] : [],
                focusType: todaySchedule.focus_type,
                officialProgramId: todaySchedule.official_program_id || officialProgram?.id,
                officialWorkoutId: todaySchedule.official_workout_id || workoutDef?.id
            });
        } catch (err: any) {
            Alert.alert('Error', err || 'Failed to start workout');
        } finally {
            setIsStartingWorkout(false);
        }
    };

    const handleAbort = () => {
        if (!activeProgram) return;
        Alert.alert(
            'Abort Program',
            'Are you sure you want to stop this program? Future scheduled workouts will be deleted.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Abort',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await dispatch(abortActiveProgram(activeProgram.id)).unwrap();
                            Alert.alert('Success', 'Program aborted successfully.');
                        } catch (err: any) {
                            Alert.alert('Error', err || 'Failed to abort program');
                        }
                    }
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <AppHeader title="FitReps" />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>💪</Text>
                    </View>

                    <Text style={styles.welcomeText}>Welcome Back!</Text>

                    <Text style={styles.userText}>
                        Logged in as: {'\n'}
                        <Text style={styles.userEmail}>{user?.email}</Text>
                    </Text>

                    <View style={styles.divider} />

                    <PrimaryButton
                        title="View My Workouts"
                        onPress={() => navigation.navigate('WorkoutList')}
                    />

                    <TouchableOpacity
                        onPress={() => navigation.navigate('Profile')}
                        style={styles.profileLink}
                    >
                        <Text style={styles.profileLinkText}>View Profile & Goals</Text>
                    </TouchableOpacity>

                    <Text style={styles.footerText}>
                        Ready to hit the gym? Tap above to start tracking your progress!
                    </Text>
                </View>

                {/* Today's Training Card */}
                <View style={[styles.card, styles.trainingCard]}>
                    <View style={styles.weightHeader}>
                        <Text style={[styles.cardTitle, { color: '#fff' }]}>Today's Schedule</Text>
                        {!activeProgram && status !== 'loading' && (
                            <TouchableOpacity onPress={() => navigation.navigate('ProgramBuilder')}>
                                <Text style={[styles.historyLink, { color: '#e0e7ff' }]}>Build Plan +</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {status === 'loading' ? (
                        <View style={styles.todayContent}>
                            <ActivityIndicator color="#fff" style={{ marginVertical: 20 }} />
                        </View>
                    ) : todaySchedule ? (
                        <View style={styles.todayContent}>
                            <Text style={styles.todayTypeText}>
                                {todaySchedule.workout_type === 'rest' ? 'Rest Day' : `${todaySchedule.workout_type.toUpperCase()} Day`}
                                {todaySchedule.focus_type && (
                                    <Text style={styles.focusLabel}> • {todaySchedule.focus_type.replace('_', ' ')}</Text>
                                )}
                            </Text>
                            <Text style={styles.todayQuote}>
                                {todaySchedule.workout_type === 'rest'
                                    ? 'Recovery is where the growth happens. Sleep well! 😴'
                                    : 'Time to crush your goals and get those gains! 💪'}
                            </Text>

                            <TouchableOpacity
                                onPress={handleStartTodayWorkout}
                                disabled={isStartingWorkout || isCreatingManual}
                                style={{ alignItems: 'center' }}
                            >
                                <Animated.View style={[
                                    styles.playButtonContainer,
                                    { transform: [{ scale: pulseAnim }] }
                                ]}>
                                    {isStartingWorkout || isCreatingManual ? (
                                        <ActivityIndicator size="large" color="#4f46e5" />
                                    ) : (
                                        <Text style={styles.playIcon}>▶</Text>
                                    )}
                                </Animated.View>
                                <Text style={styles.playButtonText}>
                                    {todaySchedule.workout_id ? 'View Workout' : 'Start Workout'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleAbort} style={styles.abortButton}>
                                <Text style={styles.abortButtonText}>Abort Program</Text>
                            </TouchableOpacity>
                        </View>
                    ) : activeProgram ? (
                        <View style={styles.todayContent}>
                            <Text style={[styles.todayQuote, { color: '#e0e7ff', marginBottom: 32 }]}>
                                You have an active program: {activeProgram.name}.{'\n'}Ready for your next session?
                            </Text>

                            <TouchableOpacity
                                onPress={handleManualLog}
                                disabled={isCreatingManual}
                                style={{ alignItems: 'center' }}
                            >
                                <Animated.View style={[
                                    styles.playButtonContainer,
                                    { transform: [{ scale: pulseAnim }] }
                                ]}>
                                    {isCreatingManual ? (
                                        <ActivityIndicator size="large" color="#4f46e5" />
                                    ) : (
                                        <Text style={styles.playIcon}>▶</Text>
                                    )}
                                </Animated.View>
                                <Text style={styles.playButtonText}>Start Workout</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleAbort} style={styles.abortButton}>
                                <Text style={styles.abortButtonText}>Abort Program</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.todayContent}>
                            <Text style={[styles.todayQuote, { color: '#e0e7ff' }]}>
                                No active training program. Build a smart plan to stay consistent!
                            </Text>
                            <TouchableOpacity
                                style={[styles.startWorkoutButton, { backgroundColor: '#fff' }]}
                                onPress={() => navigation.navigate('ProgramBuilder')}
                            >
                                <Text style={[styles.startWorkoutButtonText, { color: '#4f46e5' }]}>Create Program</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Body Weight Card */}
                <View style={[styles.card, { marginTop: 24, paddingVertical: 24 }]}>
                    {/* ... (keep body weight section) ... */}
                    <View style={styles.weightHeader}>
                        <Text style={styles.cardTitle}>Current Weight</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('WeightHistory')}>
                            <Text style={styles.historyLink}>History →</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.weightRow}>
                        <View style={styles.weightInputWrapper}>
                            <TextInput
                                style={styles.weightInput}
                                placeholder="0.0"
                                keyboardType="numeric"
                                value={weight}
                                onChangeText={setWeight}
                            />
                            <Text style={styles.kgBadge}>kg</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.saveButton, isLogging && styles.buttonDisabled]}
                            onPress={handleLogWeight}
                            disabled={isLogging}
                        >
                            {isLogging ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.saveButtonText}>Log</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {latestLog && (
                        <Text style={styles.lastLoggedText}>
                            Last recorded: {new Date(latestLog.date).toLocaleDateString()}
                        </Text>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
    },
    card: {
        backgroundColor: '#fff',
        padding: 32,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2,
    },
    trainingCard: {
        marginTop: 24,
        paddingVertical: 24,
        backgroundColor: '#4f46e5',
    },
    iconContainer: {
        width: 80,
        height: 80,
        backgroundColor: '#e0e7ff',
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    icon: {
        fontSize: 32,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 8,
    },
    userText: {
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 20,
    },
    userEmail: {
        fontWeight: '600',
        color: '#334155',
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#f1f5f9',
        marginBottom: 32,
    },
    footerText: {
        color: '#94a3b8',
        textAlign: 'center',
        marginTop: 24,
        fontSize: 14,
        lineHeight: 20,
    },
    weightHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    historyLink: {
        color: '#4f46e5',
        fontWeight: '600',
        fontSize: 14,
    },
    weightRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 16,
    },
    weightInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginRight: 12,
    },
    weightInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    kgBadge: {
        color: '#64748b',
        fontWeight: 'bold',
    },
    saveButton: {
        backgroundColor: '#4f46e5',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 70,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    lastLoggedText: {
        fontSize: 12,
        color: '#94a3b8',
        textAlign: 'left',
        width: '100%',
    },
    todayContent: {
        width: '100%',
        alignItems: 'center',
    },
    todayTypeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    todayQuote: {
        fontSize: 14,
        color: '#e0e7ff',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    startWorkoutButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 16,
        width: '100%',
        alignItems: 'center',
    },
    startWorkoutButtonText: {
        color: '#4f46e5',
        fontWeight: 'bold',
        fontSize: 16,
    },
    focusLabel: {
        fontSize: 14,
        color: '#e0e7ff',
        fontWeight: '500',
    },
    abortButton: {
        marginTop: 24,
        padding: 8,
    },
    abortButtonText: {
        color: '#e0e7ff',
        fontSize: 12,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    playButtonContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        marginBottom: 12,
    },
    playIcon: {
        fontSize: 32,
        color: '#4f46e5',
        marginLeft: 4, // Visual centering adjustment
    },
    playButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    profileLink: {
        marginTop: 16,
        padding: 8,
    },
    profileLinkText: {
        color: '#4f46e5',
        fontWeight: 'bold',
        fontSize: 14,
        textDecorationLine: 'underline',
    }
});
