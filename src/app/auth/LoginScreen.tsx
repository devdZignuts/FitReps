import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../store';
import { login, clearAuthError } from '../../store/slices/authSlice';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
    const dispatch = useAppDispatch();
    const navigation = useNavigation<any>();
    const { status, error } = useAppSelector((state) => state.auth);

    const [email, setEmail] = useState('gauddafaxaffau-3715@yopmail.com');
    const [password, setPassword] = useState('Test@123');
    const [localError, setLocalError] = useState<string | null>(null);

    const isLoading = status === 'loading';

    const handleLogin = async () => {
        setLocalError(null);
        dispatch(clearAuthError());

        if (!email || !password) {
            setLocalError('Please enter both email and password.');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setLocalError('Please enter a valid email address.');
            return;
        }

        dispatch(login({ email, password }));
    };

    const traverseToRegister = () => {
        dispatch(clearAuthError());
        setLocalError(null);
        navigation.navigate('Register');
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to continue your fitness journey.</Text>

                    {(error || localError) && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{localError || error}</Text>
                        </View>
                    )}

                    <View style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="you@example.com"
                                placeholderTextColor="#94a3b8"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                editable={!isLoading}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                placeholderTextColor="#94a3b8"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={true}
                                editable={!isLoading}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={isLoading}
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('ForgotPassword')}
                            style={styles.forgotPassword}
                        >
                            <Text style={styles.link}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <View style={styles.signupContainer}>
                            <Text style={styles.footerText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={traverseToRegister}>
                                <Text style={styles.link}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
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
        fontSize: 16,
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
    footer: {
        marginTop: 24,
    },
    forgotPassword: {
        alignItems: 'center',
        marginBottom: 24,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    footerText: {
        color: '#64748b',
    },
    link: {
        color: '#4f46e5',
        fontWeight: '600',
    },
});
