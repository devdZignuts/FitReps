export interface OfficialExercise {
    name: string;
    sets: number;
    reps: string;
}

export interface OfficialWorkout {
    id: string;
    name: string;
    focus: string;
    exercises: OfficialExercise[];
}

export interface OfficialProgram {
    id: string;
    name: string;
    description: string;
    durationWeeks: number;
    schedule: {
        [dayIndex: number]: string | 'rest'; // 0 is Monday
    };
    workouts: {
        [workoutId: string]: OfficialWorkout;
    };
}

export const OFFICIAL_PROGRAMS: OfficialProgram[] = [
    {
        id: 'science_upper_lower',
        name: 'Science-Based Upper/Lower',
        description: '4 Days per week, focused on balanced muscle growth with specific focus rotations.',
        durationWeeks: 4,
        schedule: {
            0: 'upper_1',
            1: 'lower_1',
            2: 'rest',
            3: 'upper_2',
            4: 'lower_2',
            5: 'rest',
            6: 'rest',
        },
        workouts: {
            upper_1: {
                id: 'upper_1',
                name: 'Upper 1',
                focus: 'back_focus',
                exercises: [
                    { name: 'Weighted Pull-ups / Lat Pulldown', sets: 4, reps: '6-8' },
                    { name: 'Barbell or Chest-Supported Row', sets: 3, reps: '8-10' },
                    { name: 'Incline DB Press', sets: 3, reps: '8-10' },
                    { name: 'Cable Row (different grip)', sets: 3, reps: '10-12' },
                    { name: 'Lateral Raises', sets: 3, reps: '12-15' },
                    { name: 'Barbell Curl', sets: 3, reps: '8-12' },
                    { name: 'Rope Pushdown', sets: 2, reps: '10-12' },
                ],
            },
            lower_1: {
                id: 'lower_1',
                name: 'Lower 1',
                focus: 'quad_focus',
                exercises: [
                    { name: 'Back Squat / Hack Squat', sets: 4, reps: '5-8' },
                    { name: 'Leg Press', sets: 3, reps: '8-10' },
                    { name: 'Romanian Deadlift (moderate)', sets: 3, reps: '8-10' },
                    { name: 'Leg Extension', sets: 3, reps: '12-15' },
                    { name: 'Standing Calf Raise', sets: 3, reps: '10-15' },
                    { name: 'Abs', sets: 3, reps: '10-15' },
                ],
            },
            upper_2: {
                id: 'upper_2',
                name: 'Upper 2',
                focus: 'chest_focus',
                exercises: [
                    { name: 'Barbell Bench Press', sets: 4, reps: '5-8' },
                    { name: 'Incline Machine / DB Press', sets: 3, reps: '8-10' },
                    { name: 'Chest-Supported Row', sets: 3, reps: '8-10' },
                    { name: 'Lat Pulldown (different grip)', sets: 3, reps: '10-12' },
                    { name: 'Lateral Raise (variation)', sets: 3, reps: '12-15' },
                    { name: 'Overhead Tricep Extension', sets: 3, reps: '10-12' },
                    { name: 'Hammer Curl', sets: 2, reps: '10-12' },
                ],
            },
            lower_2: {
                id: 'lower_2',
                name: 'Lower 2',
                focus: 'glute_ham_focus',
                exercises: [
                    { name: 'Romanian Deadlift (heavy)', sets: 4, reps: '6-8' },
                    { name: 'Bulgarian Split Squat', sets: 3, reps: '8-10' },
                    { name: 'Lying/Seated Leg Curl', sets: 3, reps: '10-12' },
                    { name: 'Hip Thrust', sets: 3, reps: '8-10' },
                    { name: 'Seated Calf Raise', sets: 3, reps: '12-15' },
                    { name: 'Abs', sets: 3, reps: '10-15' },
                ],
            },
        },
    },
    {
        id: 'science_ppl',
        name: 'Science-Based PPL',
        description: '6 Days per week, high volume strategy for maximum hypertrophy.',
        durationWeeks: 4,
        schedule: {
            0: 'push_1',
            1: 'pull_1',
            2: 'legs_1',
            3: 'push_2',
            4: 'pull_2',
            5: 'legs_2',
            6: 'rest',
        },
        workouts: {
            push_1: {
                id: 'push_1',
                name: 'Push 1',
                focus: 'chest_focus',
                exercises: [
                    { name: 'Barbell Bench Press', sets: 4, reps: '5-8' },
                    { name: 'Incline DB Press', sets: 3, reps: '8-10' },
                    { name: 'Machine Chest Press / Dips', sets: 3, reps: '8-12' },
                    { name: 'Lateral Raises', sets: 3, reps: '12-15' },
                    { name: 'Tricep Pushdown', sets: 3, reps: '10-12' },
                    { name: 'Overhead Tricep Extension', sets: 2, reps: '10-12' },
                ],
            },
            pull_1: {
                id: 'pull_1',
                name: 'Pull 1',
                focus: 'back_width_focus',
                exercises: [
                    { name: 'Weighted Pull-ups / Lat Pulldown', sets: 4, reps: '6-8' },
                    { name: 'Single Arm Lat Pulldown', sets: 3, reps: '8-12' },
                    { name: 'Chest Supported Row', sets: 3, reps: '8-10' },
                    { name: 'Face Pulls', sets: 3, reps: '12-15' },
                    { name: 'Barbell or DB Curl', sets: 3, reps: '8-12' },
                    { name: 'Hammer Curl', sets: 2, reps: '10-12' },
                ],
            },
            legs_1: {
                id: 'legs_1',
                name: 'Legs 1',
                focus: 'quad_focus',
                exercises: [
                    { name: 'Back Squat / Hack Squat', sets: 4, reps: '5-8' },
                    { name: 'Leg Press', sets: 3, reps: '8-10' },
                    { name: 'Walking Lunges', sets: 3, reps: '10' },
                    { name: 'Leg Extension', sets: 3, reps: '12-15' },
                    { name: 'Standing Calf Raise', sets: 3, reps: '10-15' },
                    { name: 'Abs', sets: 3, reps: '10-15' },
                ],
            },
            push_2: {
                id: 'push_2',
                name: 'Push 2',
                focus: 'shoulder_focus',
                exercises: [
                    { name: 'Overhead Barbell / DB Press', sets: 4, reps: '6-8' },
                    { name: 'Incline DB Press', sets: 3, reps: '8-10' },
                    { name: 'Lateral Raises (slow controlled)', sets: 4, reps: '12-15' },
                    { name: 'Machine Chest Press', sets: 2, reps: '10-12' },
                    { name: 'Skull Crushers', sets: 3, reps: '8-12' },
                    { name: 'Rope Pushdown', sets: 2, reps: '10-12' },
                ],
            },
            pull_2: {
                id: 'pull_2',
                name: 'Pull 2',
                focus: 'back_thickness_focus',
                exercises: [
                    { name: 'Barbell Row', sets: 4, reps: '6-8' },
                    { name: 'Seated Cable Row', sets: 3, reps: '8-10' },
                    { name: 'Lat Pulldown (different grip)', sets: 3, reps: '10-12' },
                    { name: 'Rear Delt Fly', sets: 3, reps: '12-15' },
                    { name: 'Preacher Curl', sets: 3, reps: '8-12' },
                    { name: 'Cable Curl', sets: 2, reps: '12' },
                ],
            },
            legs_2: {
                id: 'legs_2',
                name: 'Legs 2',
                focus: 'glute_ham_focus',
                exercises: [
                    { name: 'Romanian Deadlift', sets: 4, reps: '6-8' },
                    { name: 'Bulgarian Split Squat', sets: 3, reps: '8-10' },
                    { name: 'Lying Leg Curl', sets: 3, reps: '10-12' },
                    { name: 'Hip Thrust', sets: 3, reps: '8-10' },
                    { name: 'Seated Calf Raise', sets: 3, reps: '12-15' },
                    { name: 'Abs', sets: 3, reps: '10-15' },
                ],
            },
        },
    },
];
