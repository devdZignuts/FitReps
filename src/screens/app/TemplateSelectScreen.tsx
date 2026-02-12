import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AppHeader from '../../components/layout/AppHeader';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { WORKOUT_TEMPLATES, WorkoutTemplate } from '../../constants/workoutTemplates';

export default function TemplateSelectScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { workoutId } = route.params;

    const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);

    const toggleTemplate = (templateId: string) => {
        setSelectedTemplates(prev =>
            prev.includes(templateId)
                ? prev.filter(id => id !== templateId)
                : [...prev, templateId]
        );
    };

    const handleConfirm = () => {
        const templates = WORKOUT_TEMPLATES.filter(t => selectedTemplates.includes(t.id));
        navigation.navigate('WorkoutDetail', { workoutId, selectedTemplates: templates });
    };

    const renderTemplate = ({ item }: { item: WorkoutTemplate }) => {
        const isSelected = selectedTemplates.includes(item.id);
        return (
            <TouchableOpacity
                onPress={() => toggleTemplate(item.id)}
                style={[
                    styles.templateCard,
                    isSelected && styles.templateCardSelected
                ]}
            >
                <View style={styles.templateHeader}>
                    <Text style={[
                        styles.templateName,
                        isSelected && styles.templateNameSelected
                    ]}>
                        {item.name}
                    </Text>
                    <View style={[
                        styles.checkCircle,
                        isSelected && styles.checkCircleSelected
                    ]}>
                        {isSelected && <Text style={styles.checkText}>✓</Text>}
                    </View>
                </View>
                <Text style={styles.templateMuscles}>
                    {item.muscles.join(' • ')}
                </Text>
                <Text style={styles.templateExerciseCount}>
                    {item.exercises.length} exercises
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <AppHeader title="Add Workout" showProfile={false} showBack={true} />

            <View style={styles.headerBox}>
                <Text style={styles.title}>Select Workout Templates</Text>
                <Text style={styles.subtitle}>
                    Choose one or more templates to build your workout
                </Text>
            </View>

            <FlatList
                data={WORKOUT_TEMPLATES}
                keyExtractor={(item) => item.id}
                renderItem={renderTemplate}
                contentContainerStyle={styles.listContent}
            />

            <View style={styles.footer}>
                <Text style={styles.footerStats}>
                    {selectedTemplates.length} Template{selectedTemplates.length !== 1 ? 's' : ''} Selected
                </Text>
                <PrimaryButton
                    title="Generate Exercises"
                    onPress={handleConfirm}
                    disabled={selectedTemplates.length === 0}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    headerBox: {
        paddingHorizontal: 24,
        paddingVertical: 24,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    subtitle: {
        color: '#64748b',
        marginTop: 4,
    },
    listContent: {
        paddingVertical: 20,
        paddingBottom: 120,
    },
    templateCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    templateCardSelected: {
        backgroundColor: '#eef2ff',
        borderColor: '#c7d2fe',
    },
    templateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    templateName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    templateNameSelected: {
        color: '#312e81',
    },
    checkCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkCircleSelected: {
        backgroundColor: '#4f46e5',
        borderColor: 'transparent',
    },
    checkText: {
        color: '#fff',
        fontSize: 12,
    },
    templateMuscles: {
        color: '#64748b',
        fontSize: 14,
        marginBottom: 4,
    },
    templateExerciseCount: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        backgroundColor: '#fff',
    },
    footerStats: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 16,
        textTransform: 'uppercase',
        textAlign: 'center',
        letterSpacing: 1,
    },
});
