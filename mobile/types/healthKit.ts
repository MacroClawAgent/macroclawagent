export interface HealthKitWorkout {
  id: string;
  activityType: string;
  startDate: string;
  endDate: string;
  durationMinutes: number;
  totalEnergyBurned: number; // kcal
  totalDistance?: number;    // metres
  heartRateAvg?: number;     // bpm
}

export interface DailyActivitySummary {
  date: string;
  activeEnergyBurned: number; // kcal
  steps: number;
  heartRateAvg?: number;      // bpm
  bodyWeightKg?: number;
  recentWorkouts: HealthKitWorkout[];
}
