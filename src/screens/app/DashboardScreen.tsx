import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store';
import { logBodyWeight, fetchLatestWeight } from '../../store/slices/weightSlice';
import { fetchTodaySchedule, fetchActiveProgram, abortActiveProgram, fetchFullSchedule } from '../../store/slices/trainingSlice';
import { addWorkout } from '../../store/slices/workoutSlice';
import AppHeader from '../../components/layout/AppHeader';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { WORKOUT_TEMPLATES } from '../../constants/workoutTemplates';
import { OFFICIAL_PROGRAMS } from '../../constants/officialPrograms';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
    FadeInDown,
    FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import AnimatedButton from '../../components/ui/AnimatedButton';
import StatCard from '../../components/ui/StatCard';
import ProgressRing from '../../components/ui/ProgressRing';

const { width } = Dimensions.get('window');

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

    // Animations
    const pulseAnim = useSharedValue(1);
    const glowAnim = useSharedValue(0);
    const rotateAnim = useSharedValue(0);

    useEffect(() => {
        // Pulse animation for play button
        pulseAnim.value = withRepeat(
            withSequence(
                withSpring(1.08, { damping: 2, stiffness: 100 }),
                withSpring(1, { damping: 2, stiffness: 100 })
            ),
            -1,
            false
        );

        // Glow animation
        glowAnim.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            false
        );

        // Rotate animation for stats
        rotateAnim.value = withRepeat(
            withTiming(360, { duration: 20000, easing: Easing.linear }),
            -1,
            false
        );
    }, []);

    const playButtonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseAnim.value }],
    }));

    const glowAnimatedStyle = useAnimatedStyle(() => ({
        opacity: glowAnim.value,
    }));

    useFocusEffect(
        useCallback(() => {
            dispatch(fetchLatestWeight());
            dispatch(fetchActiveProgram());
            dispatch(fetchTodaySchedule());
            dispatch(fetchFullSchedule());
        }, [dispatch])
    );

    const handleManualLog = async () => {
        if (!activeProgram) return;
        setIsCreatingManual(true);
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const upcomingWorkouts = fullSchedule
                .filter(s => s.workout_type !== 'rest' && s.workout_date >= todayStr)
                .sort((a, b) => a.workout_date.localeCompare(b.workout_date));

            const targetItem = upcomingWorkouts.length > 0 ? upcomingWorkouts[0] : null;
            const officialProgram = (targetItem?.official_program_id ? OFFICIAL_PROGRAMS.find(p => p.id === targetItem.official_program_id) : null)
                || OFFICIAL_PROGRAMS.find(p => p.name === activeProgram.name || activeProgram.name.includes(p.name));

            let title = '';
            let targetWorkoutType = targetItem?.workout_type;
            let offProgId = targetItem?.official_program_id || officialProgram?.id;
            let offWorkId = targetItem?.official_workout_id;

            if (officialProgram) {
                if (!targetWorkoutType) {
                    const firstDay = officialProgram.schedule[0];
                    targetWorkoutType = firstDay !== 'rest' ? firstDay : 'push_1';
                }
                const workoutDef = officialProgram.workouts[targetWorkoutType];
                title = workoutDef?.name || targetWorkoutType.toUpperCase().replace('_', ' ');
                offWorkId = offWorkId || workoutDef?.id;
            } else {
                title = targetWorkoutType
                    ? targetWorkoutType.toUpperCase().replace('_', ' ')
                    : 'Manual Workout';
            }

            const result = await dispatch(addWorkout({
                title: title,
                workout_date: todayStr,
                note: `Direct log - ${title}`
            })).unwrap();

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'Body weight logged successfully!');
        } catch (err: any) {
            Alert.alert('Error', err || 'Failed to log weight');
        } finally {
            setIsLogging(false);
        }
    };

    const handleStartTodayWorkout = async () => {
        if (!todaySchedule || !activeProgram) return;

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

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
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
            <LinearGradient
                colors={['#0f172a', '#1e293b', '#334155']}
                style={styles.backgroundGradient}
            />
            
            <AppHeader title="FitReps" />

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Welcome Section */}
                <Animated.View entering={FadeIn.duration(800)}>
                    <LinearGradient
                        colors={['#6366f1', '#8b5cf6', '#ec4899']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroCard}
                    >
                        <Animated.View style={[styles.heroGlow, glowAnimatedStyle]} />
                        
                        <View style={styles.heroContent}>
                            <Text style={styles.heroEmoji}>💪</Text>
                            <Text style={styles.heroTitle}>Welcome Back, Champion!</Text>
                            <Text style={styles.heroSubtitle}>{user?.email}</Text>
                            
                            <View style={styles.quickActions}>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('WorkoutList')}
                                    style={styles.quickActionButton}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.quickActionIcon}>📊</Text>
                                    <Text style={styles.quickActionText}>Workouts</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Profile')}
                                    style={styles.quickActionButton}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.quickActionIcon}>👤</Text>
                                    <Text style={styles.quickActionText}>Profile</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('WeightHistory')}
                                    style={styles.quickActionButton}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.quickActionIcon}>📈</Text>
                                    <Text style={styles.quickActionText}>Progress</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Today's Training Section */}
                <Animated.View entering={FadeInDown.delay(200).springify()}>
                    <LinearGradient
                        colors={['#f97316', '#ef4444']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.trainingCard}
                    >
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionHeaderLeft}>
                                <Text style={styles.sectionIcon}>🔥</Text>
                                <Text style={styles.sectionTitle}>Today's Session</Text>
                            </View>
                            {!activeProgram && status !== 'loading' && (
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('ProgramBuilder')}
                                    style={styles.buildPlanButton}
                                >
                                    <Text style={styles.buildPlanText}>+ Build</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {status === 'loading' ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#fff" />
                            </View>
                        ) : todaySchedule ? (
                            <View style={styles.workoutContent}>
                                <View style={styles.workoutBadge}>
                                    <Text style={styles.workoutBadgeText}>
                                        {todaySchedule.workout_type === 'rest' ? '😴 REST DAY' : `💪 ${todaySchedule.workout_type.toUpperCase().replace('_', ' ')}`}
                                    </Text>
                                    {todaySchedule.focus_type && (
                                        <Text style={styles.focusBadge}>
                                            {todaySchedule.focus_type.replace('_', ' ')}
                                        </Text>
                                    )}
                                </View>
                                
                                <Text style={styles.motivationText}>
                                    {todaySchedule.workout_type === 'rest'
                                        ? 'Recovery is where the magic happens. Your muscles need this! 🌟'
                                        : "Let's crush this workout and reach new heights! 🚀"}
                                </Text>

                                <TouchableOpacity
                                    onPress={handleStartTodayWorkout}
                                    disabled={isStartingWorkout || isCreatingManual}
                                    activeOpacity={0.9}
                                    style={styles.playButtonContainer}
                                >
                                    <Animated.View style={[styles.playButton, playButtonAnimatedStyle]}>
                                        <LinearGradient
                                            colors={['#fff', '#f8fafc']}
                                            style={styles.playButtonGradient}
                                        >
                                            {isStartingWorkout || isCreatingManual ? (
                                                <ActivityIndicator size="large" color="#f97316" />
                                            ) : (
                                                <Text style={styles.playIcon}>▶</Text>
                                            )}
                                        </LinearGradient>
                                    </Animated.View>
                                    <View style={styles.playButtonShadow} />
                                </TouchableOpacity>
                                
                                <Text style={styles.startText}>
                                    {todaySchedule.workout_id ? 'Continue Workout' : 'Start Workout'}
                                </Text>

                                {activeProgram && (
                                    <TouchableOpacity onPress={handleAbort} style={styles.abortButton}>
                                        <Text style={styles.abortText}>End Program</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ) : activeProgram ? (
                            <View style={styles.workoutContent}>
                                <Text style={styles.motivationText}>
                                    Active Program: {activeProgram.name}.{"\n"}Ready for your next session? 💪
                                </Text>

                                <TouchableOpacity
                                    onPress={handleManualLog}
                                    disabled={isCreatingManual}
                                    activeOpacity={0.9}
                                    style={styles.playButtonContainer}
                                >
                                    <Animated.View style={[styles.playButton, playButtonAnimatedStyle]}>
                                        <LinearGradient
                                            colors={['#fff', '#f8fafc']}
                                            style={styles.playButtonGradient}
                                        >
                                            {isCreatingManual ? (
                                                <ActivityIndicator size="large" color="#f97316" />
                                            ) : (
                                                <Text style={styles.playIcon}>▶</Text>
                                            )}
                                        </LinearGradient>
                                    </Animated.View>
                                </TouchableOpacity>
                                
                                <Text style={styles.startText}>Start Workout</Text>

                                <TouchableOpacity onPress={handleAbort} style={styles.abortButton}>
                                    <Text style={styles.abortText}>End Program</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.workoutContent}>
                                <Text style={styles.motivationText}>
                                    No active program yet. Let's build one! 🎯
                                </Text>
                                <AnimatedButton
                                    title="Create Program"
                                    onPress={() => navigation.navigate('ProgramBuilder')}
                                    colors={['#fff', '#f8fafc']}
                                    textStyle={{ color: '#f97316' }}
                                    style={{ marginTop: 16 }}
                                />
                            </View>
                        )}
                    </LinearGradient>
                </Animated.View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statRow}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <StatCard
                                title="Streak"
                                value="7"
                                icon="🔥"
                                subtitle="days"
                                colors={['#10b981', '#22c55e']}
                                delay={400}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <StatCard
                                title="Total"
                                value="42"
                                icon="💪"
                                subtitle="workouts"
                                colors={['#06b6d4', '#3b82f6']}
                                delay={500}
                            />
                        </View>
                    </View>
                    
                    <Animated.View entering={FadeInDown.delay(600).springify()}>
                        <StatCard
                            title="This Week"
                            value="5/6"
                            icon="⚡"
                            subtitle="sessions completed"
                            colors={['#8b5cf6', '#ec4899']}
                            onPress={() => navigation.navigate('WorkoutList')}
                        />
                    </Animated.View>
                </View>

                {/* Weight Tracking */}
                <Animated.View entering={FadeInDown.delay(700).springify()}>
                    <BlurView intensity={20} style={styles.weightCard}>
                        <LinearGradient
                            colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                            style={styles.weightCardGradient}
                        >
                            <View style={styles.weightHeader}>
                                <View style={styles.weightHeaderLeft}>
                                    <Text style={styles.weightIcon}>⚖️</Text>
                                    <Text style={styles.weightTitle}>Body Weight</Text>
                                </View>
                                <TouchableOpacity onPress={() => navigation.navigate('WeightHistory')}>
                                    <Text style={styles.historyLink}>History →</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.weightInputRow}>
                                <View style={styles.weightInputContainer}>
                                    <TextInput
                                        style={styles.weightInput}
                                        placeholder="80.0"
                                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                        keyboardType="numeric"
                                        value={weight}
                                        onChangeText={setWeight}
                                    />
                                    <Text style={styles.weightUnit}>kg</Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.logButton}
                                    onPress={handleLogWeight}
                                    disabled={isLogging}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={['#10b981', '#22c55e']}
                                        style={styles.logButtonGradient}
                                    >
                                        {isLogging ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <Text style={styles.logButtonText}>Log</Text>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>

                            {latestLog && (
                                <Text style={styles.lastLogged}>
                                    Last: {new Date(latestLog.date).toLocaleDateString()} • {latestLog.weight_kg}kg
                                </Text>
                            )}
                        </LinearGradient>
                    </BlurView>
                </Animated.View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    scrollContent: {
        padding: 20,
    },
    heroCard: {
        borderRadius: 28,
        padding: 28,
        marginBottom: 20,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.5,
        shadowRadius: 24,
        elevation: 12,
        overflow: 'hidden',
    },
    heroGlow: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        opacity: 0.3,
    },
    heroContent: {
        alignItems: 'center',
    },
    heroEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 24,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    quickActionButton: {
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 16,
        minWidth: 90,
    },
    quickActionIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    quickActionText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    trainingCard: {
        borderRadius: 28,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.5,
        shadowRadius: 24,
        elevation: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionIcon: {
        fontSize: 24,
        marginRight: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    buildPlanButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    buildPlanText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    workoutContent: {
        alignItems: 'center',
    },
    workoutBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
        marginBottom: 16,
        alignItems: 'center',
    },
    workoutBadgeText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 1,
    },
    focusBadge: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 4,
        textTransform: 'capitalize',
    },
    motivationText: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 28,
    },
    playButtonContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    playButton: {
        width: 96,
        height: 96,
    },
    playButtonGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 16,
        elevation: 10,
    },
    playButtonShadow: {
        position: 'absolute',
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        top: 4,
        left: 0,
        zIndex: -1,
    },
    playIcon: {
        fontSize: 36,
        color: '#f97316',
        marginLeft: 4,
    },
    startText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
    },
    abortButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    abortText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 13,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    statsGrid: {
        marginBottom: 20,
    },
    statRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    weightCard: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    weightCardGradient: {
        padding: 24,
    },
    weightHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    weightHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    weightIcon: {
        fontSize: 24,
        marginRight: 8,
    },
    weightTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    historyLink: {
        color: '#10b981',
        fontWeight: '600',
        fontSize: 14,
    },
    weightInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    weightInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 4,
        marginRight: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    weightInput: {
        flex: 1,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        paddingVertical: 12,
    },
    weightUnit: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.6)',
    },
    logButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    logButtonGradient: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        minWidth: 80,
        alignItems: 'center',
    },
    logButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    lastLogged: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: 12,
    },
});
