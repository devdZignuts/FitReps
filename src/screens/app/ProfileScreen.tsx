
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    TextInput
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store';
import { updateProfile, fetchProfile } from '../../store/slices/profileSlice';
import { logout } from '../../store/slices/authSlice';
import AppHeader from '../../components/layout/AppHeader';
import AnimatedButton from '../../components/ui/AnimatedButton';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const GOALS = [
    { id: 'lose_fat', label: 'Lose Fat', icon: '🔥', color: ['#f97316', '#ef4444'] },
    { id: 'build_muscle', label: 'Build Muscle', icon: '💪', color: ['#8b5cf6', '#ec4899'] },
    { id: 'body_recomp', label: 'Body Recomposition', icon: '⚖️', color: ['#06b6d4', '#3b82f6'] },
    { id: 'increase_strength', label: 'Increase Strength', icon: '🏋️‍♂️', color: ['#10b981', '#22c55e'] },
    { id: 'improve_fitness', label: 'Improve Fitness & Endurance', icon: '🏃‍♂️', color: ['#eab308', '#f59e0b'] },
];

export default function ProfileScreen() {
    const dispatch = useAppDispatch();
    const { profile, status } = useAppSelector((state) => state.profile);
    const { user } = useAppSelector((state) => state.auth);

    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(profile?.goal || '');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!profile) {
            dispatch(fetchProfile());
        }
    }, [dispatch, profile]);

    useEffect(() => {
        if (profile?.goal) {
            setSelectedGoal(profile.goal);
        }
    }, [profile]);

    const handleUpdateGoal = async () => {
        if (!selectedGoal) return;

        setLoading(true);
        try {
            await dispatch(updateProfile({ goal: selectedGoal })).unwrap();
            setIsEditingGoal(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'Fitness goal updated successfully!');
        } catch (error: any) {
            Alert.alert('Error', error || 'Failed to update goal');
        } finally {
            setLoading(false);
        }
    };

    const renderDetail = (label: string, value: string | number | null | undefined) => (
        <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value || 'Not set'}</Text>
        </View>
    );

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => dispatch(logout())
                },
            ]
        );
    };

    if (status === 'loading' && !profile) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#4f46e5" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0f172a', '#1e293b', '#334155']}
                style={styles.backgroundGradient}
            />
            
            <AppHeader title="My Profile" showBack={true} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <Animated.View entering={FadeIn.duration(600)} style={styles.profileHeader}>
                    <LinearGradient
                        colors={['#6366f1', '#8b5cf6']}
                        style={styles.avatarContainer}
                    >
                        <Text style={styles.avatarText}>
                            {user?.email?.charAt(0).toUpperCase()}
                        </Text>
                    </LinearGradient>
                    <Text style={styles.emailText}>{user?.email}</Text>
                </Animated.View>

                {/* Fitness Journey Section */}
                <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionHeaderLeft}>
                            <Text style={styles.sectionIcon}>🎯</Text>
                            <Text style={styles.sectionTitle}>Fitness Journey</Text>
                        </View>
                        {!isEditingGoal && (
                            <TouchableOpacity onPress={() => setIsEditingGoal(true)}>
                                <Text style={styles.editLink}>Change</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {isEditingGoal ? (
                        <View style={styles.goalEditContainer}>
                            <Text style={styles.instructionText}>Select your new primary goal:</Text>
                            {GOALS.map(g => (
                                <TouchableOpacity
                                    key={g.id}
                                    style={[styles.goalCard, selectedGoal === g.id && styles.selectedGoalCard]}
                                    onPress={() => setSelectedGoal(g.id)}
                                    activeOpacity={0.8}
                                >
                                    {selectedGoal === g.id ? (
                                        <LinearGradient
                                            colors={g.color}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={styles.goalCardGradient}
                                        >
                                            <Text style={styles.goalIcon}>{g.icon}</Text>
                                            <Text style={[styles.goalLabel, styles.selectedGoalLabel]}>{g.label}</Text>
                                        </LinearGradient>
                                    ) : (
                                        <View style={styles.goalCardContent}>
                                            <Text style={styles.goalIcon}>{g.icon}</Text>
                                            <Text style={styles.goalLabel}>{g.label}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                            <View style={styles.editActions}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => {
                                        setIsEditingGoal(false);
                                        setSelectedGoal(profile?.goal || '');
                                    }}
                                >
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <AnimatedButton
                                        title="Save Goal"
                                        onPress={handleUpdateGoal}
                                        isLoading={loading}
                                        colors={['#10b981', '#22c55e']}
                                    />
                                </View>
                            </View>
                        </View>
                    ) : (
                        <LinearGradient
                            colors={GOALS.find(g => g.id === profile?.goal)?.color || ['#6366f1', '#8b5cf6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.currentGoalCard}
                        >
                            <Text style={styles.currentGoalIcon}>
                                {GOALS.find(g => g.id === profile?.goal)?.icon || '🎯'}
                            </Text>
                            <View style={styles.currentGoalContent}>
                                <Text style={styles.currentGoalTitle}>Current Goal</Text>
                                <Text style={styles.currentGoalLabel}>
                                    {GOALS.find(g => g.id === profile?.goal)?.label}
                                </Text>
                                <Text style={styles.experienceBadge}>
                                    {profile?.experience_level?.toUpperCase()}
                                </Text>
                            </View>
                        </LinearGradient>
                    )}
                </Animated.View>

                {/* Stats & Metrics */}
                <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionHeaderLeft}>
                            <Text style={styles.sectionIcon}>📊</Text>
                            <Text style={styles.sectionTitle}>Stats & Metrics</Text>
                        </View>
                    </View>
                    
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <LinearGradient
                                colors={['rgba(99, 102, 241, 0.2)', 'rgba(139, 92, 246, 0.2)']}
                                style={styles.statBox}
                            >
                                <Text style={styles.statLabel}>Gender</Text>
                                <Text style={styles.statValue}>{profile?.gender || 'Not set'}</Text>
                            </LinearGradient>
                        </View>
                        
                        <View style={styles.statItem}>
                            <LinearGradient
                                colors={['rgba(16, 185, 129, 0.2)', 'rgba(34, 197, 94, 0.2)']}
                                style={styles.statBox}
                            >
                                <Text style={styles.statLabel}>Weight</Text>
                                <Text style={styles.statValue}>{profile?.weight_kg} kg</Text>
                            </LinearGradient>
                        </View>
                        
                        <View style={styles.statItem}>
                            <LinearGradient
                                colors={['rgba(6, 182, 212, 0.2)', 'rgba(59, 130, 246, 0.2)']}
                                style={styles.statBox}
                            >
                                <Text style={styles.statLabel}>Height</Text>
                                <Text style={styles.statValue}>{profile?.height_cm} cm</Text>
                            </LinearGradient>
                        </View>
                        
                        <View style={styles.statItem}>
                            <LinearGradient
                                colors={['rgba(249, 115, 22, 0.2)', 'rgba(239, 68, 68, 0.2)']}
                                style={styles.statBox}
                            >
                                <Text style={styles.statLabel}>Birth Date</Text>
                                <Text style={styles.statValue}>
                                    {profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not set'}
                                </Text>
                            </LinearGradient>
                        </View>
                    </View>
                </Animated.View>

                {/* Logout Button */}
                <Animated.View entering={FadeInDown.delay(600).springify()}>
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#ef4444', '#dc2626']}
                            style={styles.logoutGradient}
                        >
                            <Text style={styles.logoutText}>🚪 Logout</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>

                <View style={{ height: 40 }} />
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
        padding: 24,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#4f46e5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#fff',
    },
    emailText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0f172a',
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    editLink: {
        color: '#4f46e5',
        fontWeight: 'bold',
    },
    detailCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc',
    },
    detailLabel: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 14,
        color: '#0f172a',
        fontWeight: '700',
    },
    goalEditContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        borderWidth: 2,
        borderColor: '#e0e7ff',
    },
    instructionText: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 16,
    },
    goalCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#f1f5f9',
        marginBottom: 12,
    },
    selectedGoalCard: {
        borderColor: '#4f46e5',
        backgroundColor: '#f5f3ff',
    },
    goalIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    goalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#334155',
    },
    selectedGoalLabel: {
        color: '#4f46e5',
    },
    editActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
    },
    cancelButton: {
        paddingHorizontal: 16,
    },
    cancelText: {
        color: '#94a3b8',
        fontWeight: 'bold',
    },
    logoutButton: {
        marginTop: 24,
        marginBottom: 48,
        backgroundColor: '#fee2e2',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    logoutText: {
        color: '#ef4444',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
