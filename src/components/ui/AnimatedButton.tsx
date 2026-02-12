import React, { useEffect } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

interface AnimatedButtonProps {
    title: string;
    onPress: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    colors?: string[];
    hapticFeedback?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
    title,
    onPress,
    isLoading = false,
    disabled = false,
    style,
    textStyle,
    colors = ['#6366f1', '#8b5cf6'],
    hapticFeedback = true,
}) => {
    const scale = useSharedValue(1);
    const glowOpacity = useSharedValue(0);

    useEffect(() => {
        // Subtle glow pulse animation
        glowOpacity.value = withSequence(
            withTiming(0.3, { duration: 1500 }),
            withTiming(0.1, { duration: 1500 })
        );
    }, []);

    const handlePressIn = () => {
        scale.value = withSpring(0.95, { damping: 10, stiffness: 100 });
        if (hapticFeedback) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 10, stiffness: 100 });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    return (
        <AnimatedTouchable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || isLoading}
            activeOpacity={0.8}
            style={[animatedStyle]}
        >
            <LinearGradient
                colors={disabled || isLoading ? ['#94a3b8', '#94a3b8'] : colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.button, style]}
            >
                {/* Glow effect layer */}
                <Animated.View style={[styles.glowLayer, glowStyle]} />
                
                {isLoading ? (
                    <ActivityIndicator color="white" style={styles.loader} />
                ) : null}
                <Text style={[styles.text, textStyle]}>
                    {isLoading ? 'Processing...' : title}
                </Text>
            </LinearGradient>
        </AnimatedTouchable>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
    glowLayer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#fff',
        borderRadius: 16,
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

export default AnimatedButton;
