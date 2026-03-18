export interface HevySet {
  index: number;
  type: "normal" | "warmup" | "dropset" | "failure";
  weight_kg: number | null;
  reps: number | null;
  distance_meters: number | null;
  duration_seconds: number | null;
  rpe: number | null;
}

export interface HevyExercise {
  index: number;
  title: string;
  notes: string | null;
  exercise_template_id: string;
  supersets_id: number | null;
  sets: HevySet[];
}

export interface HevyWorkout {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  updated_at: string;
  created_at: string;
  exercises: HevyExercise[];
}

export interface HevyWorkoutsResponse {
  page: number;
  page_count: number;
  workouts: HevyWorkout[];
}

export interface HevyRoutine {
  id: string;
  title: string;
  updated_at: string;
  created_at: string;
}

export interface HevyRoutinesResponse {
  page: number;
  page_count: number;
  routines: HevyRoutine[];
}

/** Derived stats computed from a HevyWorkout */
export interface HevyWorkoutStats {
  workout: HevyWorkout;
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  uniqueExercises: string[];
  durationMinutes: number;
}
