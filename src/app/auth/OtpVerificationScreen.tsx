
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { authService } from '../../services/auth.service';

export default function OtpVerificationScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { email } = route.params || {};

    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleVerify = async () => {
        setError(null);

        if (!otp || otp.length < 6) {
            setError('Please enter a valid verification code.');
            return;
        }

        setIsLoading(true);
        try {
            await authService.verifyOtp(email, otp);
            navigation.navigate('NewPassword');
        } catch (err: any) {
            setError(err.message || 'Invalid verification code.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.content}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Text style={styles.backButtonText}>← Back</Text>
                        </TouchableOpacity>

                        <Text style={styles.title}>Enter Code</Text>
                        <Text style={styles.subtitle}>
                            We sent a verification code to {email}. Please enter it below.
                        </Text>

                        {error && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        <View style={styles.formContainer}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Verification Code</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="123456"
                                    placeholderTextColor="#94a3b8"
                                    value={otp}
                                    onChangeText={setOtp}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    editable={!isLoading}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleVerify}
                            disabled={isLoading}
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.buttonText}>Verify Code</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    content: {
        width: '100%',
    },
    backButton: {
        marginBottom: 24,
    },
    backButtonText: {
        color: '#4f46e5',
        fontWeight: '600',
        fontSize: 16,
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
    },
    errorContainer: {
        backgroundColor: '#fef2f2',
        padding: 16,
        borderRadius: 8,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    errorText: {
        color: '#b91c1c',
        fontWeight: '500',
    },
    formContainer: {
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#334155',
        marginBottom: 8,
    },
    input: {
        width: '100%',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 24,
        textAlign: 'center',
        letterSpacing: 8,
        color: '#0f172a',
    },
    button: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 8,
        backgroundColor: '#4f46e5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#a5b4fc',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
