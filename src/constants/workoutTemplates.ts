export interface WorkoutTemplateExercise {
    name: string;
    muscleTag?: string;
    defaultSets?: Array<{
        reps: number;
        weight: number | null;
    }>;
}

export interface WorkoutTemplate {
    id: string;
    name: string;
    muscles: string[];
    exercises: WorkoutTemplateExercise[];
}

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
    {
        id: 'push',
        name: 'Push',
        muscles: ['chest', 'shoulders', 'triceps'],
        exercises: [
            {
                name: 'Barbell Bench Press',
                muscleTag: 'Chest - Compound',
                defaultSets: [
                    { reps: 8, weight: null },
                    { reps: 8, weight: null },
                    { reps: 8, weight: null },
                ],
            },
            {
                name: 'Incline Dumbbell Press',
                muscleTag: 'Chest - Upper',
                defaultSets: [
                    { reps: 10, weight: null },
                    { reps: 10, weight: null },
                    { reps: 10, weight: null },
                ],
            },
            {
                name: 'Cable Fly',
                muscleTag: 'Chest - Isolation',
                defaultSets: [
                    { reps: 12, weight: null },
                    { reps: 12, weight: null },
                ],
            },
            {
                name: 'Overhead Press',
                muscleTag: 'Shoulders - Compound',
                defaultSets: [
                    { reps: 8, weight: null },
                    { reps: 8, weight: null },
                    { reps: 8, weight: null },
                ],
            },
            {
                name: 'Lateral Raises',
                muscleTag: 'Shoulders - Medial',
                defaultSets: [
                    { reps: 12, weight: null },
                    { reps: 12, weight: null },
                ],
            },
            {
                name: 'Face Pulls',
                muscleTag: 'Shoulders - Rear',
                defaultSets: [
                    { reps: 15, weight: null },
                    { reps: 15, weight: null },
                ],
            },
            {
                name: 'Tricep Dips',
                muscleTag: 'Triceps - Compound',
                defaultSets: [
                    { reps: 10, weight: null },
                    { reps: 10, weight: null },
                ],
            },
            {
                name: 'Tricep Pushdown',
                muscleTag: 'Triceps - Isolation',
                defaultSets: [
                    { reps: 12, weight: null },
                    { reps: 12, weight: null },
                ],
            },
        ],
    },
    {
        id: 'pull',
        name: 'Pull',
        muscles: ['back', 'biceps'],
        exercises: [
            {
                name: 'Pull-ups',
                muscleTag: 'Back - Lats',
                defaultSets: [
                    { reps: 8, weight: null },
                    { reps: 8, weight: null },
                    { reps: 8, weight: null },
                ],
            },
            {
                name: 'Barbell Row',
                muscleTag: 'Back - Mid',
                defaultSets: [
                    { reps: 8, weight: null },
                    { reps: 8, weight: null },
                    { reps: 8, weight: null },
                ],
            },
            {
                name: 'Face Pulls',
                muscleTag: 'Back - Rear Delts',
                defaultSets: [
                    { reps: 15, weight: null },
                    { reps: 15, weight: null },
                ],
            },
            {
                name: 'Lat Pulldown',
                muscleTag: 'Back - Lats',
                defaultSets: [
                    { reps: 10, weight: null },
                    { reps: 10, weight: null },
                ],
            },
            {
                name: 'Seated Cable Row',
                muscleTag: 'Back - Mid',
                defaultSets: [
                    { reps: 10, weight: null },
                    { reps: 10, weight: null },
                ],
            },
            {
                name: 'Barbell Curl',
                muscleTag: 'Biceps - Compound',
                defaultSets: [
                    { reps: 10, weight: null },
                    { reps: 10, weight: null },
                ],
            },
            {
                name: 'Hammer Curl',
                muscleTag: 'Biceps - Brachialis',
                defaultSets: [
                    { reps: 12, weight: null },
                    { reps: 12, weight: null },
                ],
            },
        ],
    },
    {
        id: 'legs',
        name: 'Legs',
        muscles: ['quads', 'hamstrings', 'glutes', 'calves'],
        exercises: [
            {
                name: 'Barbell Squat',
                muscleTag: 'Quads - Compound',
                defaultSets: [
                    { reps: 8, weight: null },
                    { reps: 8, weight: null },
                    { reps: 8, weight: null },
                ],
            },
            {
                name: 'Romanian Deadlift',
                muscleTag: 'Hamstrings - Compound',
                defaultSets: [
                    { reps: 10, weight: null },
                    { reps: 10, weight: null },
                ],
            },
            {
                name: 'Hip Thrust',
                muscleTag: 'Glutes - Compound',
                defaultSets: [
                    { reps: 10, weight: null },
                    { reps: 10, weight: null },
                ],
            },
            {
                name: 'Standing Calf Raise',
                muscleTag: 'Calves - Isolation',
                defaultSets: [
                    { reps: 15, weight: null },
                    { reps: 15, weight: null },
                ],
            },
        ],
    },
    {
        id: 'upper',
        name: 'Upper Body',
        muscles: ['chest', 'back', 'shoulders', 'arms'],
        exercises: [
            {
                name: 'Barbell Bench Press',
                muscleTag: 'Chest - Compound',
                defaultSets: [
                    { reps: 8, weight: null },
                    { reps: 8, weight: null },
                ],
            },
            {
                name: 'Pull-ups',
                muscleTag: 'Back - Lats',
                defaultSets: [
                    { reps: 8, weight: null },
                    { reps: 8, weight: null },
                ],
            },
            {
                name: 'Overhead Press',
                muscleTag: 'Shoulders - Compound',
                defaultSets: [
                    { reps: 8, weight: null },
                    { reps: 8, weight: null },
                ],
            },
            {
                name: 'Barbell Row',
                muscleTag: 'Back - Mid',
                defaultSets: [
                    { reps: 10, weight: null },
                    { reps: 10, weight: null },
                ],
            },
            {
                name: 'Incline Dumbbell Press',
                muscleTag: 'Chest - Upper',
                defaultSets: [
                    { reps: 10, weight: null },
                    { reps: 10, weight: null },
                ],
            },
            {
                name: 'Barbell Curl',
                muscleTag: 'Biceps',
                defaultSets: [
                    { reps: 10, weight: null },
                    { reps: 10, weight: null },
                ],
            },
            {
                name: 'Tricep Pushdown',
                muscleTag: 'Triceps',
                defaultSets: [
                    { reps: 12, weight: null },
                    { reps: 12, weight: null },
                ],
            },
        ],
    },
    {
        id: 'lower',
        name: 'Lower Body',
        muscles: ['quads', 'hamstrings', 'glutes', 'calves'],
        exercises: [
            {
                name: 'Barbell Squat',
                muscleTag: 'Quads - Compound',
                defaultSets: [
                    { reps: 8, weight: null },
                    { reps: 8, weight: null },
                    { reps: 8, weight: null },
                ],
            },
            {
                name: 'Romanian Deadlift',
                muscleTag: 'Hamstrings - Compound',
                defaultSets: [
                    { reps: 10, weight: null },
                    { reps: 10, weight: null },
                ],
            },
            {
                name: 'Hip Thrust',
                muscleTag: 'Glutes - Compound',
                defaultSets: [
                    { reps: 10, weight: null },
                    { reps: 10, weight: null },
                ],
            },
            {
                name: 'Leg Press',
                muscleTag: 'Quads - Secondary',
                defaultSets: [
                    { reps: 12, weight: null },
                    { reps: 12, weight: null },
                ],
            },
            {
                name: 'Leg Curl',
                muscleTag: 'Hamstrings - Isolation',
                defaultSets: [
                    { reps: 12, weight: null },
                    { reps: 12, weight: null },
                ],
            },
            {
                name: 'Standing Calf Raise',
                muscleTag: 'Calves - Isolation',
                defaultSets: [
                    { reps: 15, weight: null },
                    { reps: 15, weight: null },
                ],
            },
        ],
    },
    {
        id: 'chest',
        name: 'Chest',
        muscles: ['chest'],
        exercises: [
            {
                name: 'Barbell Bench Press',
                muscleTag: 'Compound - Sternal',
                defaultSets: [
                    { reps: 8, weight: null },
                    { reps: 8, weight: null },
                    { reps: 8, weight: null },
                ],
            },
            {
                name: 'Incline Dumbbell Press',
                muscleTag: 'Compound - Upper',
                defaultSets: [
                    { reps: 10, weight: null },
                    { reps: 10, weight: null },
                ],
            },
            {
                name: 'Cable Fly',
                muscleTag: 'Isolation',
                defaultSets: [
                    { reps: 12, weight: null },
                    { reps: 12, weight: null },
                ],
            },
        ],
    },
    {
        id: 'back',
        name: 'Back',
        muscles: ['back'],
        exercises: [
            {
                name: 'Pull-ups',
                muscleTag: 'Compound - Lats',
                defaultSets: [
                    { reps: 8, weight: null },
                    { reps: 8, weight: null },
                    { reps: 8, weight: null },
                ],
            },
            {
                name: 'Barbell Row',
                muscleTag: 'Compound - Mid Back',
                defaultSets: [
                    { reps: 8, weight: null },
                    { reps: 8, weight: null },
                ],
            },
            {
                name: 'Face Pulls',
                muscleTag: 'Isolation - Rear Delts',
                defaultSets: [
                    { reps: 15, weight: null },
                    { reps: 15, weight: null },
                ],
            },
        ],
    },
    {
        id: 'shoulders',
        name: 'Shoulders',
        muscles: ['shoulders'],
        exercises: [
            {
                name: 'Overhead Press',
                muscleTag: 'Compound',
                defaultSets: [
                    { reps: 8, weight: null },
                    { reps: 8, weight: null },
                    { reps: 8, weight: null },
                ],
            },
            {
                name: 'Lateral Raises',
                muscleTag: 'Medial Delts',
                defaultSets: [
                    { reps: 12, weight: null },
                    { reps: 12, weight: null },
                ],
            },
            {
                name: 'Face Pulls',
                muscleTag: 'Rear Delts',
                defaultSets: [
                    { reps: 15, weight: null },
                    { reps: 15, weight: null },
                ],
            },
        ],
    },
    {
        id: 'arms',
        name: 'Arms',
        muscles: ['biceps', 'triceps'],
        exercises: [
            {
                name: 'Barbell Curl',
                muscleTag: 'Biceps - Compound',
                defaultSets: [
                    { reps: 10, weight: null },
                    { reps: 10, weight: null },
                ],
            },
            {
                name: 'Hammer Curl',
                muscleTag: 'Biceps - Brachialis',
                defaultSets: [
                    { reps: 12, weight: null },
                    { reps: 12, weight: null },
                ],
            },
            {
                name: 'Tricep Dips',
                muscleTag: 'Triceps - Compound',
                defaultSets: [
                    { reps: 10, weight: null },
                    { reps: 10, weight: null },
                ],
            },
            {
                name: 'Tricep Pushdown',
                muscleTag: 'Triceps - Isolation',
                defaultSets: [
                    { reps: 12, weight: null },
                    { reps: 12, weight: null },
                ],
            },
        ],
    },
];
