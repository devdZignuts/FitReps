
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
import PrimaryButton from '../../components/ui/PrimaryButton';
import AppHeader from '../../components/layout/AppHeader';

const { width } = Dimensions.get('window');

const GOALS = [
    { id: 'lose_fat', label: 'Lose Fat', icon: '🔥' },
    { id: 'build_muscle', label: 'Build Muscle', icon: '💪' },
    { id: 'body_recomp', label: 'Body Recomposition', icon: '⚖️' },
    { id: 'increase_strength', label: 'Increase Strength', icon: '🏋️‍♂️' },
    { id: 'improve_fitness', label: 'Improve Fitness & Endurance', icon: '🏃‍♂️' },
];

const EXPERIENCE_LEVELS = [
    { id: 'beginner', label: 'Beginner', description: '0-1 years training' },
    { id: 'intermediate', label: 'Intermediate', description: '1-3 years training' },
    { id: 'advanced', label: 'Advanced', description: '3+ years training' },
];

const GENDERS = ['Male', 'Female', 'Other'];

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
        if (step === 1 && !goal) return Alert.alert('Selection Required', 'Please select a primary goal.');
        if (step === 2 && !experience) return Alert.alert('Selection Required', 'Please select your experience level.');

        if (step < 3) {
            setStep(step + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = async () => {
        if (!gender || !dob || !weight || !height) {
            return Alert.alert('Missing Info', 'Please fill in all personal details.');
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
                    <View style={styles.stepContainer}>
                        <Text style={styles.title}>What is your primary goal?</Text>
                        <Text style={styles.subtitle}>We will customize your experience based on this.</Text>
                        {GOALS.map(g => (
                            <TouchableOpacity
                                key={g.id}
                                style={[styles.selectableCard, goal === g.id && styles.selectedCard]}
                                onPress={() => setGoal(g.id)}
                            >
                                <Text style={styles.cardIcon}>{g.icon}</Text>
                                <Text style={[styles.cardLabel, goal === g.id && styles.selectedLabel]}>{g.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                );
            case 2:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.title}>Your experience level?</Text>
                        <Text style={styles.subtitle}>How long have you been training consistently?</Text>
                        {EXPERIENCE_LEVELS.map(lev => (
                            <TouchableOpacity
                                key={lev.id}
                                style={[styles.selectableCard, experience === lev.id && styles.selectedCard]}
                                onPress={() => setExperience(lev.id)}
                            >
                                <View>
                                    <Text style={[styles.cardLabel, experience === lev.id && styles.selectedLabel]}>{lev.label}</Text>
                                    <Text style={styles.cardDescription}>{lev.description}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                );
            case 3:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.title}>A few more details...</Text>
                        <Text style={styles.subtitle}>To calculate your metrics accurately.</Text>

                        <Text style={styles.inputLabel}>Gender</Text>
                        <View style={styles.row}>
                            {GENDERS.map(g => (
                                <TouchableOpacity
                                    key={g}
                                    style={[styles.chip, gender === g && styles.selectedChip]}
                                    onPress={() => setGender(g)}
                                >
                                    <Text style={[styles.chipText, gender === g && styles.selectedChipText]}>{g}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.inputLabel}>Date of Birth (YYYY-MM-DD)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="1995-10-25"
                            value={dob}
                            onChangeText={setDob}
                        />

                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <Text style={styles.inputLabel}>Weight (kg)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="80"
                                    keyboardType="numeric"
                                    value={weight}
                                    onChangeText={setWeight}
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                                <Text style={styles.inputLabel}>Height (cm)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="180"
                                    keyboardType="numeric"
                                    value={height}
                                    onChangeText={setHeight}
                                />
                            </View>
                        </View>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.container}>
                <AppHeader title="Setup Profile" showProfile={false} />

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressText}>Step {step} of 3</Text>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
                        </View>
                    </View>

                    {renderStep()}
                </ScrollView>

                <View style={styles.footer}>
                    {step > 1 && (
                        <TouchableOpacity onPress={() => setStep(step - 1)} style={styles.backButton}>
                            <Text style={styles.backButtonText}>Back</Text>
                        </TouchableOpacity>
                    )}
                    <View style={{ flex: 1, marginLeft: step > 1 ? 16 : 0 }}>
                        <PrimaryButton
                            title={step === 3 ? "Let's Go!" : "Continue"}
                            onPress={handleNext}
                            isLoading={loading}
                        />
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        padding: 24,
    },
    progressHeader: {
        marginBottom: 32,
    },
    progressText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4f46e5',
    },
    stepContainer: {
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
        marginBottom: 32,
        lineHeight: 24,
    },
    selectableCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#f1f5f9',
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    selectedCard: {
        borderColor: '#4f46e5',
        backgroundColor: '#f5f3ff',
    },
    cardIcon: {
        fontSize: 24,
        marginRight: 16,
    },
    cardLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#334155',
    },
    selectedLabel: {
        color: '#4f46e5',
    },
    cardDescription: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 2,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#475569',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        color: '#0f172a',
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 8,
    },
    chip: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    selectedChip: {
        backgroundColor: '#4f46e5',
        borderColor: '#4f46e5',
    },
    chipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
    },
    selectedChipText: {
        color: '#fff',
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        paddingHorizontal: 16,
    },
    backButtonText: {
        color: '#64748b',
        fontWeight: '600',
    },
});
