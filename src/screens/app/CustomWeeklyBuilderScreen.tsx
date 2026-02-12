import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useAppDispatch } from '../../store';
import { createProgram } from '../../store/slices/trainingSlice';
import AppHeader from '../../components/layout/AppHeader';
import { useNavigation } from '@react-navigation/native';
import PrimaryButton from '../../components/ui/PrimaryButton';

const WORKOUT_TYPES = [
    { label: 'Push', value: 'push' },
    { label: 'Pull', value: 'pull' },
    { label: 'Legs', value: 'legs' },
    { label: 'Upper Body', value: 'upper' },
    { label: 'Full Body', value: 'full' },
    { label: 'Rest', value: 'rest' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function CustomWeeklyBuilderScreen() {
    const dispatch = useAppDispatch();
    const navigation = useNavigation<any>();

    const [pattern, setPattern] = useState<string[]>(Array(7).fill('rest'));
    const [durationWeeks, setDurationWeeks] = useState(4);
    const [loading, setLoading] = useState(false);

    const toggleDay = (index: number) => {
        const currentType = pattern[index];
        const currentIndex = WORKOUT_TYPES.findIndex(t => t.value === currentType);
        const nextIndex = (currentIndex + 1) % WORKOUT_TYPES.length;
        const newPattern = [...pattern];
        newPattern[index] = WORKOUT_TYPES[nextIndex].value;
        setPattern(newPattern);
    };

    const handleCreateProgram = async () => {
        setLoading(true);
        try {
            const schedule: any[] = [];
            const startDate = new Date();
            const totalDays = durationWeeks * 7;

            for (let i = 0; i < totalDays; i++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + i);
                const dayIndex = (currentDate.getDay() + 6) % 7; // Align with Monday start

                const type = pattern[dayIndex];

                // Logic for focus rotation (Day 1 vs Day 2 of same type)
                let focus: string | undefined = undefined;
                const occurenceCount = schedule.filter(s =>
                    s.workout_type === type &&
                    Math.floor(schedule.indexOf(s) / 7) === Math.floor(i / 7)
                ).length;

                if (type === 'legs' || type === 'lower') focus = occurenceCount === 0 ? 'quad_focus' : 'ham_focus';
                if (type === 'push') focus = occurenceCount === 0 ? 'chest_focus' : 'shoulder_focus';
                if (type === 'pull') focus = occurenceCount === 0 ? 'vertical_focus' : 'horizontal_focus';

                schedule.push({
                    workout_date: currentDate.toISOString().split('T')[0],
                    workout_type: type,
                    focus_type: focus,
                });
            }

            const endDate = new Date();
            endDate.setDate(endDate.getDate() + totalDays);

            await dispatch(createProgram({
                program: {
                    name: `Custom ${durationWeeks}-Week Plan`,
                    split_type: 'custom',
                    start_date: new Date().toISOString().split('T')[0],
                    end_date: endDate.toISOString().split('T')[0],
                    rest_days_per_week: pattern.filter(p => p === 'rest').length,
                    weekly_pattern: pattern,
                },
                schedule
            })).unwrap();

            Alert.alert('Success', 'Custom program created!');
            navigation.navigate('Dashboard');
        } catch (err: any) {
            Alert.alert('Error', err || 'Failed to create program');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <AppHeader title="Weekly Builder" showProfile={false} showBack={true} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Design Your Week</Text>
                <Text style={styles.subtitle}>Tap each day to change workout type</Text>

                <View style={styles.weekContainer}>
                    {DAYS.map((day, index) => (
                        <TouchableOpacity
                            key={day}
                            style={[
                                styles.dayCard,
                                pattern[index] !== 'rest' && styles.activeDayCard
                            ]}
                            onPress={() => toggleDay(index)}
                        >
                            <View style={styles.dayInfo}>
                                <Text style={styles.dayName}>{day}</Text>
                                <Text style={[
                                    styles.typeName,
                                    pattern[index] !== 'rest' && styles.activeTypeName
                                ]}>
                                    {WORKOUT_TYPES.find(t => t.value === pattern[index])?.label}
                                </Text>
                            </View>
                            <Text style={styles.chevron}>→</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.durationContainer}>
                    <Text style={styles.durationLabel}>Program Duration (Weeks)</Text>
                    <View style={styles.durationRow}>
                        {[4, 8, 12].map(w => (
                            <TouchableOpacity
                                key={w}
                                style={[styles.durationButton, durationWeeks === w && styles.activeDurationButton]}
                                onPress={() => setDurationWeeks(w)}
                            >
                                <Text style={[styles.durationText, durationWeeks === w && styles.activeDurationText]}>{w}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <PrimaryButton
                    title={loading ? 'Generating...' : 'Finalize Program'}
                    onPress={handleCreateProgram}
                    isLoading={loading}
                />
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 24,
    },
    weekContainer: {
        marginBottom: 32,
    },
    dayCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    activeDayCard: {
        backgroundColor: '#f5f3ff',
        borderColor: '#4f46e5',
    },
    dayInfo: {
        flex: 1,
    },
    dayName: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
        marginBottom: 2,
    },
    typeName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    activeTypeName: {
        color: '#4f46e5',
    },
    chevron: {
        fontSize: 18,
        color: '#94a3b8',
    },
    durationContainer: {
        marginBottom: 24,
    },
    durationLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 12,
    },
    durationRow: {
        flexDirection: 'row',
        gap: 12,
    },
    durationButton: {
        flex: 1,
        backgroundColor: '#fff',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    activeDurationButton: {
        backgroundColor: '#4f46e5',
        borderColor: '#4f46e5',
    },
    durationText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#64748b',
    },
    activeDurationText: {
        color: '#fff',
    },
    footer: {
        padding: 24,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
});
