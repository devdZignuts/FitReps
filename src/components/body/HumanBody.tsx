import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import MuscleRegion from './MuscleRegion';
import { MUSCLES } from '../../constants/muscles';

interface HumanBodyProps {
    selectedMuscles: string[];
    onToggleMuscle: (id: string) => void;
}

export default function HumanBody({ selectedMuscles, onToggleMuscle }: HumanBodyProps) {
    const frontMuscles = MUSCLES.filter(m => m.view === 'front');
    const backMuscles = MUSCLES.filter(m => m.view === 'back');

    const renderMuscleGroup = (muscles: typeof MUSCLES, title: string) => (
        <View style={styles.groupContainer}>
            <Text style={styles.groupTitle}>{title}</Text>

            {/* Head / Neck placeholder */}
            <View style={styles.headPlaceholder} />

            {/* Upper Body Segment */}
            <View style={styles.muscleContainer}>
                {muscles.filter(m => m.region === 'upper').map(muscle => (
                    <MuscleRegion
                        key={muscle.id}
                        id={muscle.id}
                        name={muscle.name}
                        isSelected={selectedMuscles.includes(muscle.id)}
                        onSelect={onToggleMuscle}
                    />
                ))}
            </View>

            {/* Waist placeholder */}
            <View style={styles.waistPlaceholder} />

            {/* Lower Body Segment */}
            <View style={styles.muscleContainer}>
                {muscles.filter(m => m.region === 'lower').map(muscle => (
                    <MuscleRegion
                        key={muscle.id}
                        id={muscle.id}
                        name={muscle.name}
                        isSelected={selectedMuscles.includes(muscle.id)}
                        onSelect={onToggleMuscle}
                    />
                ))}
            </View>
        </View>
    );

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
            <View style={styles.rootContainer}>
                {renderMuscleGroup(frontMuscles, 'Front View')}
                <View style={styles.divider} />
                {renderMuscleGroup(backMuscles, 'Back View')}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingVertical: 20,
        flexGrow: 1,
    },
    rootContainer: {
        flexDirection: 'row',
    },
    groupContainer: {
        width: 300,
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    groupTitle: {
        color: '#94a3b8',
        fontWeight: 'bold',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        fontSize: 12,
    },
    headPlaceholder: {
        width: 40,
        height: 40,
        backgroundColor: '#e2e8f0',
        borderRadius: 20,
        marginBottom: 8,
    },
    muscleContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 16,
    },
    waistPlaceholder: {
        width: 100,
        height: 8,
        backgroundColor: '#e2e8f0',
        borderRadius: 4,
        marginBottom: 16,
    },
    divider: {
        width: 1,
        backgroundColor: '#f1f5f9',
        height: '100%',
        marginHorizontal: 8,
    }
});
