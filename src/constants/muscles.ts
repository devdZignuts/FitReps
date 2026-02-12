
export interface Muscle {
    id: string;
    name: string;
    region: 'upper' | 'lower';
    view: 'front' | 'back';
}

export const MUSCLES: Muscle[] = [
    { id: 'chest', name: 'Chest', region: 'upper', view: 'front' },
    { id: 'shoulders_front', name: 'Shoulders', region: 'upper', view: 'front' },
    { id: 'biceps', name: 'Biceps', region: 'upper', view: 'front' },
    { id: 'abs', name: 'Abs', region: 'upper', view: 'front' },
    { id: 'quads', name: 'Quads', region: 'lower', view: 'front' },
    { id: 'calves_front', name: 'Calves', region: 'lower', view: 'front' },
    { id: 'back', name: 'Back', region: 'upper', view: 'back' },
    { id: 'shoulders_back', name: 'Shoulders', region: 'upper', view: 'back' },
    { id: 'triceps', name: 'Triceps', region: 'upper', view: 'back' },
    { id: 'glutes', name: 'Glutes', region: 'lower', view: 'back' },
    { id: 'hamstrings', name: 'Hamstrings', region: 'lower', view: 'back' },
    { id: 'calves_back', name: 'Calves', region: 'lower', view: 'back' },
];
