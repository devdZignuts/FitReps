import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Dimensions
} from 'react-native';
import { useAppDispatch } from '../../store';
import { updateProfile } from '../../store/slices/profileSlice';
import AppHeader from '../../components/layout/AppHeader';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    FadeIn,
    FadeInRight,
    FadeOutLeft,
    SlideInRight,
    ZoomIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AnimatedButton from '../../components/ui/AnimatedButton';
import ProgressRing from '../../components/ui/ProgressRing';

const { width } = Dimensions.get('window');

const GOALS = [
    { id: 'lose_fat', label: 'Lose Fat', icon: '🔥', color: ['#f97316', '#ef4444'] },
    { id: 'build_muscle', label: 'Build Muscle', icon: '💪', color: ['#8b5cf6', '#ec4899'] },
    { id: 'body_recomp', label: 'Body Recomposition', icon: '⚖️', color: ['#06b6d4', '#3b82f6'] },
    { id: 'increase_strength', label: 'Increase Strength', icon: '🏋️‍♂️', color: ['#10b981', '#22c55e'] },
    { id: 'improve_fitness', label: 'Improve Fitness', icon: '🏃‍♂️', color: ['#eab308', '#f59e0b'] },
];

const EXPERIENCE_LEVELS = [
    { id: 'beginner', label: 'Beginner', description: '0-1 years training', icon: '🌱' },
    { id: 'intermediate', label: 'Intermediate', description: '1-3 years training', icon: '💪' },
    { id: 'advanced', label: 'Advanced', description: '3+ years training', icon: '🚀' },
];

const GENDERS = [
    { id: 'Male', label: 'Male', icon: '👨' },
    { id: 'Female', label: 'Female', icon: '👩' },
    { id: 'Other', label: 'Other', icon: '👤' }
];

export default function OnboardingScreen() {
    const dispatch = useAppDispatch();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [goal, setGoal] = useState('');
    const [experience, setExperience] = useState('');
    const [gender, setGender] = useState('');
    const [dob, setDob] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');

    const handleNext = () => {
        if (step === 1 && !goal) {
            Alert.alert('Selection Required', 'Please select a primary goal.');
            return;
        }
        if (step === 2 && !experience) {
            Alert.alert('Selection Required', 'Please select your experience level.');
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        if (step < 3) {
            setStep(step + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setStep(step - 1);
    };

    const handleComplete = async () => {
        if (!gender || !dob || !weight || !height) {
            Alert.alert('Missing Info', 'Please fill in all personal details.');
            return;
        }

        setLoading(true);
        try {
            await dispatch(updateProfile({
                goal,
                experience_level: experience,
                gender,
                date_of_birth: dob,
                weight_kg: parseFloat(weight),
                height_cm: parseFloat(height),
                is_onboarded: true
            })).unwrap();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error: any) {
            Alert.alert('Error', error || 'Failed to save profile');
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <Animated.View 
                        entering={FadeInRight.duration(500)} 
                        exiting={FadeOutLeft.duration(300)}
                        style={styles.stepContainer}
                    >
                        <View style={styles.stepHeader}>
                            <Text style={styles.stepEmoji}>🎯</Text>
                            <Text style={styles.title}>What's your primary goal?</Text>
                            <Text style={styles.subtitle}>Choose what matters most to you right now</Text>
                        </View>

                        {GOALS.map((g, index) => (
                            <Animated.View
                                key={g.id}
                                entering={ZoomIn.delay(index * 100).springify()}
                            >
                                <TouchableOpacity
                                    style={[styles.optionCard, goal === g.id && styles.selectedCard]}
                                    onPress={() => {
                                        setGoal(g.id);
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                    }}
                                    activeOpacity={0.8}
                                >
                                    {goal === g.id ? (
                                        <LinearGradient
                                            colors={g.color}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={styles.selectedGradient}
                                        >
                                            <Text style={styles.optionIcon}>{g.icon}</Text>
                                            <Text style={[styles.optionLabel, styles.selectedLabel]}>{g.label}</Text>
                                            <View style={styles.checkmark}>
                                                <Text style={styles.checkmarkText}>✓</Text>
                                            </View>
                                        </LinearGradient>
                                    ) : (
                                        <View style={styles.optionContent}>
                                            <Text style={styles.optionIcon}>{g.icon}</Text>
                                            <Text style={styles.optionLabel}>{g.label}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </Animated.View>
                );
            case 2:
                return (
                    <Animated.View 
                        entering={FadeInRight.duration(500)} 
                        exiting={FadeOutLeft.duration(300)}
                        style={styles.stepContainer}
                    >
                        <View style={styles.stepHeader}>
                            <Text style={styles.stepEmoji}>💪</Text>
                            <Text style={styles.title}>Your experience level?</Text>
                            <Text style={styles.subtitle}>This helps us tailor your program</Text>
                        </View>

                        {EXPERIENCE_LEVELS.map((lev, index) => (
                            <Animated.View
                                key={lev.id}
                                entering={ZoomIn.delay(index * 100).springify()}
                            >
                                <TouchableOpacity
                                    style={[styles.optionCard, experience === lev.id && styles.selectedCard]}
                                    onPress={() => {
                                        setExperience(lev.id);
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                    }}
                                    activeOpacity={0.8}
                                >
                                    {experience === lev.id ? (
                                        <LinearGradient
                                            colors={['#6366f1', '#8b5cf6']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={styles.selectedGradient}
                                        >
                                            <View style={styles.experienceContent}>
                                                <Text style={styles.experienceIcon}>{lev.icon}</Text>
                                                <View style={styles.experienceText}>
                                                    <Text style={[styles.optionLabel, styles.selectedLabel]}>{lev.label}</Text>
                                                    <Text style={styles.experienceDescription}>{lev.description}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.checkmark}>
                                                <Text style={styles.checkmarkText}>✓</Text>
                                            </View>
                                        </LinearGradient>
                                    ) : (
                                        <View style={styles.experienceContent}>
                                            <Text style={styles.experienceIcon}>{lev.icon}</Text>
                                            <View style={styles.experienceText}>
                                                <Text style={styles.optionLabel}>{lev.label}</Text>
                                                <Text style={[styles.experienceDescription, { color: '#64748b' }]}>{lev.description}</Text>
                                            </View>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </Animated.View>
                );
            case 3:
                return (
                    <Animated.View 
                        entering={FadeInRight.duration(500)} 
                        exiting={FadeOutLeft.duration(300)}
                        style={styles.stepContainer}
                    >
                        <View style={styles.stepHeader}>
                            <Text style={styles.stepEmoji}>📊</Text>
                            <Text style={styles.title}>Personal Details</Text>
                            <Text style={styles.subtitle}>Help us calculate your metrics accurately</Text>
                        </View>

                        <Text style={styles.inputLabel}>Gender</Text>
                        <View style={styles.genderRow}>
                            {GENDERS.map((g) => (
                                <TouchableOpacity
                                    key={g.id}
                                    style={[styles.genderChip, gender === g.id && styles.selectedGenderChip]}
                                    onPress={() => {
                                        setGender(g.id);
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    }}
                                    activeOpacity={0.8}
                                >
                                    {gender === g.id ? (
                                        <LinearGradient
                                            colors={['#10b981', '#22c55e']}
                                            style={styles.genderChipGradient}
                                        >
                                            <Text style={styles.genderIcon}>{g.icon}</Text>
                                            <Text style={styles.selectedGenderText}>{g.label}</Text>
                                        </LinearGradient>
                                    ) : (
                                        <>
                                            <Text style={styles.genderIcon}>{g.icon}</Text>
                                            <Text style={styles.genderText}>{g.label}</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.inputLabel}>Date of Birth</Text>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputIcon}>📅</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="YYYY-MM-DD (e.g., 1995-10-25)"
                                placeholderTextColor="#94a3b8"
                                value={dob}
                                onChangeText={setDob}
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <Text style={styles.inputLabel}>Weight (kg)</Text>
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.inputIcon}>⚖️</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="80"
                                        placeholderTextColor="#94a3b8"
                                        keyboardType="numeric"
                                        value={weight}
                                        onChangeText={setWeight}
                                    />
                                </View>
                            </View>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                                <Text style={styles.inputLabel}>Height (cm)</Text>
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.inputIcon}>📏</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="180"
                                        placeholderTextColor="#94a3b8"
                                        keyboardType="numeric"
                                        value={height}
                                        onChangeText={setHeight}
                                    />
                                </View>
                            </View>
                        </View>
                    </Animated.View>
                );
            default:
                return null;
        }
    };

    const progress = step / 3;

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <LinearGradient
                colors={['#0f172a', '#1e293b']}
                style={styles.container}
            >
                <AppHeader title="Welcome to FitReps" showProfile={false} />

                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Progress Ring */}
                    <Animated.View entering={FadeIn.duration(800)} style={styles.progressContainer}>
                        <ProgressRing
                            progress={progress}
                            size={120}
                            strokeWidth={10}
                            color="#10b981"
                            backgroundColor="rgba(255, 255, 255, 0.1)"
                        >
                            <Text style={styles.progressText}>Step</Text>
                            <Text style={styles.progressNumber}>{step}/3</Text>
                        </ProgressRing>
                    </Animated.View>

                    {renderStep()}
                </ScrollView>

                <View style={styles.footer}>
                    {step > 1 && (
                        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                            <Text style={styles.backButtonText}>← Back</Text>
                        </TouchableOpacity>
                    )}
                    <View style={{ flex: 1, marginLeft: step > 1 ? 16 : 0 }}>
                        <AnimatedButton
                            title={step === 3 ? "Let's Go! 🚀" : "Continue"}
                            onPress={handleNext}
                            isLoading={loading}
                            colors={step === 3 ? ['#10b981', '#22c55e'] : ['#6366f1', '#8b5cf6']}
                        />
                    </View>
                </View>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
    },
    progressContainer: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 20,
    },
    progressText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '600',
    },
    progressNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    stepContainer: {
        flex: 1,
    },
    stepHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },
    stepEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        lineHeight: 24,
    },
    optionCard: {
        borderRadius: 20,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    selectedCard: {
        borderColor: 'transparent',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 8,
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    selectedGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    optionIcon: {
        fontSize: 32,
        marginRight: 16,
    },
    optionLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'rgba(255, 255, 255, 0.9)',
        flex: 1,
    },
    selectedLabel: {
        color: '#fff',
    },
    checkmark: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmarkText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    experienceContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    experienceIcon: {
        fontSize: 32,
        marginRight: 16,
    },
    experienceText: {
        flex: 1,
    },
    experienceDescription: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 4,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 8,
        marginTop: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    inputIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        color: '#fff',
        fontWeight: '500',
    },
    row: {
        flexDirection: 'row',
    },
    genderRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8,
    },
    genderChip: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    selectedGenderChip: {
        borderColor: 'transparent',
    },
    genderChipGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    genderIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    genderText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.7)',
    },
    selectedGenderText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButtonText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '600',
        fontSize: 16,
    },
});
