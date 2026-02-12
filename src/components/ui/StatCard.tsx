import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: string;
    subtitle?: string;
    colors?: string[];
    onPress?: () => void;
    delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    subtitle,
    colors = ['#6366f1', '#8b5cf6'],
    onPress,
    delay = 0,
}) => {
    const CardContent = (
        <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
        >
            <View style={styles.iconContainer}>
                {icon && <Text style={styles.icon}>{icon}</Text>}
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.value}>{value}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
        </LinearGradient>
    );

    if (onPress) {
        return (
            <Animated.View entering={FadeInDown.delay(delay).springify()}>
                <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
                    {CardContent}
                </TouchableOpacity>
            </Animated.View>
        );
    }

    return (
        <Animated.View entering={FadeInDown.delay(delay).springify()}>
            {CardContent}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    gradient: {
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    icon: {
        fontSize: 28,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.8)',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    value: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
    },
});

export default StatCard;
