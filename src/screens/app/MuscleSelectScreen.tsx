import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import AppHeader from '../../components/layout/AppHeader';
import HumanBody from '../../components/body/HumanBody';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function MuscleSelectScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { workoutId } = route.params;

    const [selectedMuscleIds, setSelectedMuscleIds] = useState<string[]>([]);

    const handleToggleMuscle = (id: string) => {
        setSelectedMuscleIds(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const handleContinue = () => {
        if (selectedMuscleIds.length === 0) return;
        navigation.navigate('ExercisePicker', { workoutId, selectedMuscleIds });
    };

    return (
        <View style={styles.container}>
            <AppHeader title="Select Muscles" showProfile={false} showBack={true} />

            <View style={styles.content}>
                <View style={styles.infoBox}>
                    <Text style={styles.title}>Build Your Workout</Text>
                    <Text style={styles.subtitle}>Tap a muscle to select it</Text>
                </View>

                <View style={styles.bodyContainer}>
                    <HumanBody
                        selectedMuscles={selectedMuscleIds}
                        onToggleMuscle={handleToggleMuscle}
                    />
                </View>

                <View style={styles.footer}>
                    <View style={styles.counterRow}>
                        <Text style={styles.counterLabel}>Selection Count</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {selectedMuscleIds.length} Selected
                            </Text>
                        </View>
                    </View>

                    <PrimaryButton
                        title="Continue to Exercises"
                        onPress={handleContinue}
                        disabled={selectedMuscleIds.length === 0}
                    />

                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.resetButton}
                    >
                        <Text style={styles.resetText}>Reset & Exit</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
    },
    infoBox: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: '#f8fafc',
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
    bodyContainer: {
        flex: 1,
        paddingVertical: 16,
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
    },
    counterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    counterLabel: {
        color: '#475569',
        fontWeight: '600',
    },
    badge: {
        backgroundColor: '#e0e7ff',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 9999,
    },
    badgeText: {
        color: '#4f46e5',
        fontWeight: 'bold',
    },
    resetButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    resetText: {
        color: '#94a3b8',
        fontWeight: '500',
    }
});
