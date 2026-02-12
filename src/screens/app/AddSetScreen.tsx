import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppDispatch } from '../../store';
import { addSet } from '../../store/slices/setSlice';
import AppHeader from '../../components/layout/AppHeader';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function AddSetScreen() {
    const dispatch = useAppDispatch();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { exerciseId, exerciseName } = route.params;

    const [reps, setReps] = useState('');
    const [weight, setWeight] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!reps || !weight) {
            setError('Please enter both reps and weight.');
            return;
        }

        const repsNum = parseInt(reps);
        const weightNum = parseFloat(weight);

        if (isNaN(repsNum) || isNaN(weightNum)) {
            setError('Please enter valid numbers.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await dispatch(addSet({ exerciseId, reps: repsNum, weight: weightNum })).unwrap();
            navigation.goBack();
        } catch (err: any) {
            setError(err || 'Failed to add set');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <AppHeader title="Log Set" showProfile={false} showBack={true} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <Text style={styles.headerTitle}>
                            {exerciseName}
                        </Text>
                        <Text style={styles.headerSubtitle}>Log your results for this set.</Text>

                        {error && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        <View style={styles.inputRow}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Reps</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0"
                                    placeholderTextColor="#94a3b8"
                                    value={reps}
                                    onChangeText={setReps}
                                    keyboardType="number-pad"
                                    autoFocus
                                    editable={!isLoading}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Weight (kg)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0.0"
                                    placeholderTextColor="#94a3b8"
                                    value={weight}
                                    onChangeText={setWeight}
                                    keyboardType="decimal-pad"
                                    editable={!isLoading}
                                />
                            </View>
                        </View>

                        <View style={styles.footer}>
                            <PrimaryButton
                                title="Save Set"
                                onPress={handleSubmit}
                                isLoading={isLoading}
                            />

                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={styles.cancelButton}
                                disabled={isLoading}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </View>
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
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 4,
    },
    headerSubtitle: {
        color: '#64748b',
        fontSize: 16,
        fontStyle: 'italic',
        marginBottom: 32,
    },
    errorContainer: {
        backgroundColor: '#fef2f2',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#fee2e2',
        marginBottom: 24,
    },
    errorText: {
        color: '#b91c1c',
        fontWeight: '500',
    },
    inputRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 32,
    },
    inputGroup: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
        fontStyle: 'italic',
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        color: '#0f172a',
        fontSize: 24,
        textAlign: 'center',
    },
    footer: {
        marginTop: 40,
    },
    cancelButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#64748b',
        fontWeight: '600',
    },
});
