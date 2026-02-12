import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface GradientCardProps {
    children: React.ReactNode;
    colors?: string[];
    style?: ViewStyle;
    useBlur?: boolean;
    blurIntensity?: number;
}

export const GradientCard: React.FC<GradientCardProps> = ({
    children,
    colors = ['#6366f1', '#8b5cf6'],
    style,
    useBlur = false,
    blurIntensity = 10,
}) => {
    if (useBlur) {
        return (
            <BlurView intensity={blurIntensity} style={[styles.card, style]}>
                {children}
            </BlurView>
        );
    }

    return (
        <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.card, style]}
        >
            {children}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        padding: 24,
        overflow: 'hidden',
    },
});

export default GradientCard;
