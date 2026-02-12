import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface MuscleRegionProps {
    id: string;
    name: string;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export default function MuscleRegion({ id, name, isSelected, onSelect }: MuscleRegionProps) {
    return (
        <TouchableOpacity
            onPress={() => onSelect(id)}
            style={[
                styles.container,
                isSelected ? styles.selected : styles.unselected
            ]}
        >
            <Text style={[
                styles.text,
                isSelected ? styles.selectedText : styles.unselectedText
            ]}>
                {name.toUpperCase()}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        margin: 4,
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 85,
        height: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    unselected: {
        backgroundColor: '#fff',
        borderColor: '#e2e8f0',
    },
    selected: {
        backgroundColor: '#4f46e5',
        borderColor: 'transparent',
    },
    text: {
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    unselectedText: {
        color: '#475569',
    },
    selectedText: {
        color: '#fff',
    }
});
