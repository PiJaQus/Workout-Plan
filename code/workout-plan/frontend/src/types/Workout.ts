export interface Workout {
    id: number;
    name: string;
    sets: number;
    reps: string;
    notes: string;
    week_id: number;
    muscleGroups?: string[];
}