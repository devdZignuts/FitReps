
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
    { id: 'lose_fat', label: 'Lose Fat', icon: '🔥' },
    { id: 'build_muscle', label: 'Build Muscle', icon: '💪' },
    { id: 'body_recomp', label: 'Body Recomposition', icon: '⚖️' },
    { id: 'increase_strength', label: 'Increase Strength', icon: '🏋️‍♂️' },
    { id: 'improve_fitness', label: 'Improve Fitness & Endurance', icon: '🏃‍♂️' },
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
            <AppHeader title="My Profile" showBack={true} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {user?.email?.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.emailText}>{user?.email}</Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Fitness Journey</Text>
                        {!isEditingGoal && (
                            <TouchableOpacity onPress={() => setIsEditingGoal(true)}>
                                <Text style={styles.editLink}>Change Goal</Text>
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
                                >
                                    <Text style={styles.goalIcon}>{g.icon}</Text>
                                    <Text style={[styles.goalLabel, selectedGoal === g.id && styles.selectedGoalLabel]}>{g.label}</Text>
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
                                    <PrimaryButton
                                        title="Save Goal"
                                        onPress={handleUpdateGoal}
                                        isLoading={loading}
                                    />
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.detailCard}>
                            {renderDetail('Current Goal', GOALS.find(g => g.id === profile?.goal)?.label)}
                            {renderDetail('Experience', profile?.experience_level?.toUpperCase())}
                        </View>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Stats & Metrics</Text>
                    <View style={styles.detailCard}>
                        {renderDetail('Gender', profile?.gender)}
                        {renderDetail('Birth Date', profile?.date_of_birth)}
                        {renderDetail('Current Weight', `${profile?.weight_kg} kg`)}
                        {renderDetail('Height', `${profile?.height_cm} cm`)}
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
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
