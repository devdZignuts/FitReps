import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface PrimaryButtonProps {
    title: string;
    onPress: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
    title,
    onPress,
    isLoading = false,
    disabled = false,
    style,
    textStyle,
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || isLoading}
            activeOpacity={0.7}
            style={[
                styles.button,
                (disabled || isLoading) && styles.disabled,
                style
            ]}
        >
            {isLoading ? (
                <ActivityIndicator color="white" style={styles.loader} />
            ) : null}
            <Text style={[styles.text, textStyle]}>
                {isLoading ? 'Processing...' : title}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#4f46e5',
        paddingVertical: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabled: {
        opacity: 0.6,
    },
    text: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    loader: {
        marginRight: 8,
    },
});

export default PrimaryButton;
