import type { HevyWorkout, HevyWorkoutStats } from "@/types/hevy";

const HEVY_BASE = "https://api.hevyapp.com/v1";

/** Format volume in kg with comma separator */
export function formatVolume(kg: number): string {
  return `${Math.round(kg).toLocaleString()} kg`;
}

/** Guess muscle group from exercise title using keyword matching */
export function getMuscleGroupFromExercise(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("bench") || t.includes("chest") || t.includes("fly") || t.includes("pec")) return "Chest";
  if (t.includes("squat") || t.includes("leg press") || t.includes("lunge") || t.includes("quad") || t.includes("hamstring") || t.includes("calf")) return "Legs";
  if (t.includes("deadlift") || t.includes("row") || t.includes("pull") || t.includes("lat") || t.includes("back")) return "Back";
  if ((t.includes("press") && (t.includes("shoulder") || t.includes("overhead") || t.includes("ohp"))) || t.includes("lateral raise") || t.includes("delt")) return "Shoulders";
  if (t.includes("curl") || t.includes("bicep")) return "Biceps";
  if (t.includes("tricep") || t.includes("pushdown") || t.includes("skull")) return "Triceps";
  if (t.includes("plank") || t.includes("crunch") || t.includes("ab ") || t.includes("core") || t.includes("sit-up")) return "Core";
  return "Full Body";
}

/** Returns unique muscle groups for a workout */
export function getWorkoutMuscleGroups(workout: HevyWorkout): string[] {
  const groups = workout.exercises.map((e) => getMuscleGroupFromExercise(e.title));
  return [...new Set(groups)];
}

/** Format a workout date as "Today", "Yesterday", or "Mon 17 Mar" */
export function formatWorkoutDate(isoDate: string): string {
  const d = new Date(isoDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const workoutDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (workoutDay.getTime() === today.getTime()) return "Today";
  if (workoutDay.getTime() === yesterday.getTime()) return "Yesterday";
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

/** Format duration as "1h 20m" or "45m" */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/** Compute derived stats for a single workout */
export function computeWorkoutStats(workout: HevyWorkout): HevyWorkoutStats {
  let totalVolume = 0;
  let totalSets = 0;
  let totalReps = 0;
  const exerciseNames: string[] = [];

  for (const exercise of workout.exercises) {
    if (!exerciseNames.includes(exercise.title)) exerciseNames.push(exercise.title);
    for (const set of exercise.sets) {
      if (set.type === "warmup") continue;
      totalSets++;
      totalReps += set.reps ?? 0;
      if (set.weight_kg && set.reps) totalVolume += set.weight_kg * set.reps;
    }
  }

  const start = new Date(workout.start_time).getTime();
  const end = new Date(workout.end_time).getTime();
  const durationMinutes = Math.round((end - start) / 60000);

  return { workout, totalVolume, totalSets, totalReps, uniqueExercises: exerciseNames, durationMinutes };
}
