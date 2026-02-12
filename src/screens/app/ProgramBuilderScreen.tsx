import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useAppDispatch } from '../../store';
import { createProgram } from '../../store/slices/trainingSlice';
import AppHeader from '../../components/layout/AppHeader';
import { useNavigation } from '@react-navigation/native';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { OFFICIAL_PROGRAMS, OfficialProgram } from '../../constants/officialPrograms';

const DURATIONS = [
    { label: 'Weekly', value: 'weekly', days: 7 },
    { label: 'Monthly', value: 'monthly', days: 30 },
    { label: '3 Months', value: '3_months', days: 90 },
];

const SPLITS = [
    { label: 'Push Pull Legs', value: 'ppl', pattern: ['push', 'pull', 'legs'] },
    { label: 'Upper / Lower', value: 'upper_lower', pattern: ['upper', 'lower'] },
    { label: 'Full Body', value: 'full_body', pattern: ['full'] },
    { label: 'Custom / Hybrid Builder', value: 'custom', pattern: [] },
];

export default function ProgramBuilderScreen() {
    const dispatch = useAppDispatch();
    const navigation = useNavigation<any>();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [builderMode, setBuilderMode] = useState<'official' | 'custom'>('official');
    const [selectedOfficial, setSelectedOfficial] = useState<OfficialProgram>(OFFICIAL_PROGRAMS[0]);
    const [duration, setDuration] = useState(DURATIONS[1]);
    const [split, setSplit] = useState(SPLITS[0]);
    const [restDays, setRestDays] = useState(2);

    const generateSchedule = () => {
        const schedule = [];
        const startDate = new Date();
        const totalDays = duration.days;

        let splitIndex = 0;
        const workoutCountPerType: { [type: string]: number } = {};

        // Calculate training days vs rest days for dynamic distribution
        const trainingDaysPerWeek = 7 - restDays;

        for (let i = 0; i < totalDays; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            const dateString = currentDate.toISOString().split('T')[0];

            let type = 'rest';
            let focus: string | undefined = undefined;

            // More dynamic rest day distribution: 
            // Ensures we hit the target training days before forcing a rest day
            if ((i % 7) < trainingDaysPerWeek) {
                type = split.pattern[splitIndex % split.pattern.length];
                splitIndex++;
            } else {
                type = 'rest';
            }

            if (type !== 'rest') {
                const count = workoutCountPerType[type] || 0;
                if (type === 'legs' || type === 'lower') focus = count % 2 === 0 ? 'quad_focus' : 'ham_focus';
                if (type === 'push') focus = count % 2 === 0 ? 'chest_focus' : 'shoulder_focus';
                if (type === 'pull') focus = count % 2 === 0 ? 'vertical_focus' : 'horizontal_focus';
                workoutCountPerType[type] = count + 1;
            }

            schedule.push({
                workout_date: dateString,
                workout_type: type,
                focus_type: focus,
            });
        }
        return schedule;
    };

    const handleCreateProgram = async () => {
        if (split.value === 'custom' && builderMode === 'custom') {
            navigation.navigate('CustomWeeklyBuilder');
            return;
        }

        setLoading(true);
        try {
            let schedule: any[] = [];
            let programName = '';
            let splitType = '';
            let totalWeeks = duration.days / 7;
            let finalRestDays = restDays;

            if (builderMode === 'official') {
                programName = selectedOfficial.name;
                splitType = `official_${selectedOfficial.id}`;
                finalRestDays = Object.values(selectedOfficial.schedule).filter(v => v === 'rest').length;

                const startDate = new Date();
                // Align the 7-day official pattern with the actual day of the week
                // currentDate.getDay() returns 0 for Sunday, 1 for Monday, etc.
                // Our schedule object is 0 for Monday, so we need to adjust.

                for (let w = 0; w < selectedOfficial.durationWeeks; w++) {
                    for (let d = 0; d < 7; d++) {
                        const currentDate = new Date(startDate);
                        currentDate.setDate(startDate.getDate() + (w * 7) + d);

                        // dayIndex: 0 = Mon, 1 = Tue, ..., 6 = Sun
                        const dayIndex = (currentDate.getDay() + 6) % 7;

                        const type = selectedOfficial.schedule[dayIndex];
                        const workout = type !== 'rest' ? selectedOfficial.workouts[type] : null;

                        schedule.push({
                            workout_date: currentDate.toISOString().split('T')[0],
                            workout_type: type === 'rest' ? 'rest' : workout?.name || 'Workout',
                            focus_type: workout?.focus,
                            official_program_id: selectedOfficial.id,
                            official_workout_id: type === 'rest' ? undefined : type
                        });
                    }
                }
            } else {
                schedule = generateSchedule();
                programName = `${split.label} ${duration.label} Plan`;
                splitType = split.value;
            }

            const endDate = new Date();
            endDate.setDate(endDate.getDate() + (builderMode === 'official' ? selectedOfficial.durationWeeks * 7 : duration.days));

            await dispatch(createProgram({
                program: {
                    name: programName,
                    split_type: splitType,
                    start_date: new Date().toISOString().split('T')[0],
                    end_date: endDate.toISOString().split('T')[0],
                    rest_days_per_week: finalRestDays,
                    status: 'active',
                },
                schedule
            })).unwrap();

            Alert.alert('Success', 'Program created and schedule generated!');
            navigation.navigate('Dashboard');
        } catch (err: any) {
            Alert.alert('Error', err || 'Failed to create program');
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>Choose Builder Mode</Text>
                        <TouchableOpacity
                            style={[styles.optionCard, builderMode === 'official' && styles.selectedCard]}
                            onPress={() => setBuilderMode('official')}
                        >
                            <Text style={[styles.optionLabel, builderMode === 'official' && styles.selectedLabel]}>Official Science Programs</Text>
                            <Text style={styles.optionSublabel}>Expert-crafted, non-editable structures for maximum results.</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.optionCard, builderMode === 'custom' && styles.selectedCard]}
                            onPress={() => setBuilderMode('custom')}
                        >
                            <Text style={[styles.optionLabel, builderMode === 'custom' && styles.selectedLabel]}>Custom Template Builder</Text>
                            <Text style={styles.optionSublabel}>Flexible templates where you choose volume and rest days.</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 2:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>{builderMode === 'official' ? 'Select Program' : 'Select Split'}</Text>
                        {builderMode === 'official' ? (
                            OFFICIAL_PROGRAMS.map(p => (
                                <TouchableOpacity
                                    key={p.id}
                                    style={[styles.optionCard, selectedOfficial?.id === p.id && styles.selectedCard]}
                                    onPress={() => setSelectedOfficial(p)}
                                >
                                    <Text style={[styles.optionLabel, selectedOfficial?.id === p.id && styles.selectedLabel]}>{p.name}</Text>
                                    <Text style={styles.optionSublabel}>{p.description}</Text>
                                </TouchableOpacity>
                            ))
                        ) : (
                            SPLITS.map(s => (
                                <TouchableOpacity
                                    key={s.value}
                                    style={[styles.optionCard, split.value === s.value && styles.selectedCard]}
                                    onPress={() => setSplit(s)}
                                >
                                    <Text style={[styles.optionLabel, split.value === s.value && styles.selectedLabel]}>{s.label}</Text>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                );
            case 3:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>Duration & Settings</Text>
                        {builderMode === 'custom' && (
                            <>
                                <Text style={styles.sectionLabel}>Plan Duration</Text>
                                <View style={styles.row}>
                                    {DURATIONS.map(d => (
                                        <TouchableOpacity
                                            key={d.value}
                                            style={[styles.chip, duration.value === d.value && styles.selectedChip]}
                                            onPress={() => setDuration(d)}
                                        >
                                            <Text style={[styles.chipText, duration.value === d.value && styles.selectedChipText]}>{d.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {split.value === 'custom' && (
                                    <>
                                        <Text style={styles.sectionLabel}>Target Rest Days / Week</Text>
                                        <View style={styles.row}>
                                            {[1, 2, 3].map(r => (
                                                <TouchableOpacity
                                                    key={r}
                                                    style={[styles.chip, restDays === r && styles.selectedChip]}
                                                    onPress={() => setRestDays(r)}
                                                >
                                                    <Text style={[styles.chipText, restDays === r && styles.selectedChipText]}>{r} Day{r > 1 ? 's' : ''}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </>
                                )}
                            </>
                        )}
                        {builderMode === 'official' && (
                            <View style={styles.summaryBox}>
                                <Text style={styles.infoText}>Official programs have a fixed 4-week structure with pre-set rest days optimized for recovery.</Text>
                            </View>
                        )}
                    </View>
                );
            case 4:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>Program Summary</Text>
                        <View style={styles.summaryBox}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Program</Text>
                                <Text style={styles.summaryValue}>{builderMode === 'official' ? selectedOfficial.name : `${split.label} (${duration.label})`}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Style</Text>
                                <Text style={styles.summaryValue}>{builderMode === 'official' ? 'Scientific Structured' : 'Custom Template'}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Total Duration</Text>
                                <Text style={styles.summaryValue}>{builderMode === 'official' ? '4 Weeks' : duration.label}</Text>
                            </View>
                        </View>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <AppHeader title="Build Program" showProfile={false} showBack={true} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.progressHeader}>
                    <Text style={styles.stepText}>Step {step} of 4</Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${(step / 4) * 100}%` }]} />
                    </View>
                </View>

                {renderStep()}
            </ScrollView>

            <View style={styles.footer}>
                {step > 1 && (
                    <TouchableOpacity
                        onPress={() => setStep(step - 1)}
                        style={styles.backButton}
                    >
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                )}

                <View style={{ flex: 1, marginLeft: step > 1 ? 12 : 0 }}>
                    <PrimaryButton
                        title={step === 4 ? (loading ? 'Generating...' : 'Confirm Program') : 'Next'}
                        onPress={() => step === 4 ? handleCreateProgram() : setStep(step + 1)}
                        isLoading={loading}
                    />
                </View>
            </View>
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
    progressHeader: {
        marginBottom: 32,
    },
    stepText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
        marginBottom: 8,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#e2e8f0',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4f46e5',
    },
    stepContainer: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 24,
    },
    optionCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    selectedCard: {
        borderColor: '#4f46e5',
        backgroundColor: '#f5f3ff',
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#475569',
    },
    selectedLabel: {
        color: '#4f46e5',
    },
    optionSublabel: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 4,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#475569',
        marginTop: 16,
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 8,
    },
    chip: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    selectedChip: {
        backgroundColor: '#4f46e5',
        borderColor: '#4f46e5',
    },
    chipText: {
        fontSize: 14,
        color: '#475569',
        fontWeight: '600',
    },
    selectedChipText: {
        color: '#fff',
    },
    summaryBox: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc',
    },
    summaryLabel: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    summaryValue: {
        fontSize: 14,
        color: '#0f172a',
        fontWeight: '700',
    },
    infoText: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        padding: 24,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    backButton: {
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    backButtonText: {
        color: '#64748b',
        fontWeight: 'bold',
    },
});
