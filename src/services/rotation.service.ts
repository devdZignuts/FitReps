import { WorkoutTemplate, WorkoutTemplateExercise, WORKOUT_TEMPLATES } from '../constants/workoutTemplates';

export const RotationService = {
    getExercisesByFocus(workoutType: string, focusType?: string): WorkoutTemplateExercise[] {
        const template = WORKOUT_TEMPLATES.find(t => t.id === workoutType);
        if (!template) return [];

        if (!focusType) return template.exercises;

        switch (focusType) {
            case 'quad_focus':
                return template.exercises.filter(e =>
                    e.muscleTag?.includes('Quads') ||
                    e.muscleTag?.includes('Glutes') ||
                    e.muscleTag?.includes('Calves')
                ).slice(0, 4);
            case 'ham_focus':
                return template.exercises.filter(e =>
                    e.muscleTag?.includes('Hamstrings') ||
                    e.muscleTag?.includes('Glutes') ||
                    e.muscleTag?.includes('Calves')
                ).slice(0, 4);
            case 'chest_focus':
                return template.exercises.filter(e =>
                    (e.muscleTag?.includes('Chest') && !e.muscleTag?.includes('Upper')) ||
                    e.muscleTag?.includes('Shoulders') ||
                    e.muscleTag?.includes('Triceps')
                ).slice(0, 5);
            case 'shoulder_focus':
                return template.exercises.filter(e =>
                    e.muscleTag?.includes('Shoulders') ||
                    (e.muscleTag?.includes('Chest') && e.muscleTag?.includes('Upper')) ||
                    e.muscleTag?.includes('Triceps')
                ).slice(0, 5);
            case 'vertical_focus':
                return template.exercises.filter(e =>
                    e.muscleTag?.includes('Lats') ||
                    e.muscleTag?.includes('Rear Delts') ||
                    e.muscleTag?.includes('Biceps')
                ).slice(0, 5);
            case 'horizontal_focus':
                return template.exercises.filter(e =>
                    e.muscleTag?.includes('Mid') ||
                    e.muscleTag?.includes('Rear Delts') ||
                    e.muscleTag?.includes('Biceps')
                ).slice(0, 5);
            default:
                return template.exercises;
        }
    }
};
