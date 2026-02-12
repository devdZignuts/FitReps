import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppDispatch } from '../../store';
import { addExercise } from '../../store/slices/exerciseSlice';
import AppHeader from '../../components/layout/AppHeader';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function AddExerciseScreen() {
    const dispatch = useAppDispatch();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { workoutId } = route.params;

    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError('Please enter an exercise name.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await dispatch(addExercise({ workoutId, name: name.trim() })).unwrap();
            navigation.goBack();
        } catch (err: any) {
            setError(err || 'Failed to add exercise');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <AppHeader title="Add Exercise" showProfile={false} showBack={true} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <Text style={styles.headerTitle}>
                            What exercise did you do?
                        </Text>

                        {error && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    Exercise Name
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Bench Press"
                                    placeholderTextColor="#94a3b8"
                                    value={name}
                                    onChangeText={setName}
                                    autoFocus
                                    editable={!isLoading}
                                />
                            </View>

                            <Text style={styles.tipText}>
                                Tip: Keep titles clear and consistent to track progress easily.
                            </Text>
                        </View>

                        <View style={styles.footer}>
                            <PrimaryButton
                                title="Add Exercise"
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
        marginBottom: 24,
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
    form: {
        gap: 16,
    },
    inputGroup: {
        marginBottom: 16,
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
        fontSize: 18,
    },
    tipText: {
        color: '#94a3b8',
        fontSize: 14,
        fontStyle: 'italic',
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
