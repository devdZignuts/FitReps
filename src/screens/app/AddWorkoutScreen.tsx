import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppDispatch } from '../../store';
import { addWorkout } from '../../store/slices/workoutSlice';
import AppHeader from '../../components/layout/AppHeader';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { useNavigation } from '@react-navigation/native';

export default function AddWorkoutScreen() {
    const dispatch = useAppDispatch();
    const navigation = useNavigation<any>();

    const [title, setTitle] = useState('');
    const [note, setNote] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmitBlank = async () => {
        if (!title.trim()) {
            setError('Please provide a title for your workout.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await dispatch(addWorkout({
                title: title.trim(),
                note: note.trim() || null,
                workout_date: date,
            })).unwrap();

            navigation.navigate('MuscleSelect', { workoutId: result.id });
        } catch (err: any) {
            setError(err || 'Failed to create workout');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitWithTemplate = async () => {
        if (!title.trim()) {
            setError('Please provide a title for your workout.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await dispatch(addWorkout({
                title: title.trim(),
                note: note.trim() || null,
                workout_date: date,
            })).unwrap();

            navigation.navigate('TemplateSelect', { workoutId: result.id });
        } catch (err: any) {
            setError(err || 'Failed to create workout');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <AppHeader title="New Workout" showProfile={false} showBack={true} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <Text style={styles.headerTitle}>
                            Workout Details
                        </Text>

                        {error && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    Workout Title
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Morning Push Day"
                                    placeholderTextColor="#94a3b8"
                                    value={title}
                                    onChangeText={setTitle}
                                    editable={!isLoading}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    Notes (Optional)
                                </Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="How did you feel? Any focal points?"
                                    placeholderTextColor="#94a3b8"
                                    value={note}
                                    onChangeText={setNote}
                                    multiline
                                    textAlignVertical="top"
                                    editable={!isLoading}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    Date
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor="#94a3b8"
                                    value={date}
                                    onChangeText={setDate}
                                    editable={!isLoading}
                                />
                            </View>
                        </View>

                        <View style={styles.footer}>
                            <Text style={styles.optionTitle}>Choose How to Build</Text>

                            <PrimaryButton
                                title="Use Template"
                                onPress={handleSubmitWithTemplate}
                                isLoading={isLoading}
                                style={styles.templateButton}
                            />

                            <PrimaryButton
                                title="Create Blank Workout"
                                onPress={handleSubmitBlank}
                                isLoading={isLoading}
                                style={styles.blankButton}
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
        gap: 24,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: 'semibold',
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
    textArea: {
        height: 120,
    },
    footer: {
        marginTop: 40,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 16,
        textAlign: 'center',
    },
    templateButton: {
        backgroundColor: '#10b981',
        marginBottom: 12,
    },
    blankButton: {
        backgroundColor: '#64748b',
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
