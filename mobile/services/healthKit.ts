import { Platform } from "react-native";
import type { HealthKitWorkout, DailyActivitySummary } from "@/types/healthKit";

// react-native-health is an iOS-only native module.
// We import it lazily so Android/web bundles don't crash.
let AppleHealthKit: any = null;
let Permissions: any = null;

if (Platform.OS === "ios") {
  try {
    const rnh = require("react-native-health");
    AppleHealthKit = rnh.default ?? rnh;
    Permissions = rnh.HealthKitPermissions ?? AppleHealthKit?.Constants?.Permissions;
  } catch {
    // native module not linked yet (Expo Go) — silently no-op
  }
}

const READ_PERMISSIONS = [
  "ActiveEnergyBurned",
  "Steps",
  "HeartRate",
  "Weight",
  "Workout",
];

export async function initHealthKit(): Promise<boolean> {
  if (Platform.OS !== "ios" || !AppleHealthKit) return false;

  return new Promise((resolve) => {
    const perms = {
      permissions: {
        read: READ_PERMISSIONS.map((p) => (Permissions ? Permissions[p] : p)),
        write: [],
      },
    };
    AppleHealthKit.initHealthKit(perms, (err: Error | null) => {
      resolve(!err);
    });
  });
}

export async function getWorkouts(limit = 5): Promise<HealthKitWorkout[]> {
  if (Platform.OS !== "ios" || !AppleHealthKit) return [];

  return new Promise((resolve) => {
    const options = { limit, ascending: false };
    AppleHealthKit.getSamples(
      { ...options, type: "Workout" },
      (err: Error | null, results: any[]) => {
        if (err || !results) { resolve([]); return; }
        const workouts: HealthKitWorkout[] = results.map((r) => ({
          id: r.id ?? String(r.startDate),
          activityType: r.activityName ?? r.activityType ?? "Workout",
          startDate: r.startDate,
          endDate: r.endDate,
          durationMinutes: Math.round((r.duration ?? 0) / 60),
          totalEnergyBurned: Math.round(r.calories ?? r.totalEnergyBurned ?? 0),
          totalDistance: r.distance,
          heartRateAvg: r.heartRateAvg,
        }));
        resolve(workouts);
      }
    );
  });
}

export async function getTodaysCaloriesBurned(): Promise<number> {
  if (Platform.OS !== "ios" || !AppleHealthKit) return 0;

  return new Promise((resolve) => {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    AppleHealthKit.getActiveEnergyBurned(
      { startDate: startOfDay.toISOString(), endDate: now.toISOString() },
      (err: Error | null, results: any[]) => {
        if (err || !results?.length) { resolve(0); return; }
        const total = results.reduce((sum, r) => sum + (r.value ?? 0), 0);
        resolve(Math.round(total));
      }
    );
  });
}

export async function getTodaysSteps(): Promise<number> {
  if (Platform.OS !== "ios" || !AppleHealthKit) return 0;

  return new Promise((resolve) => {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    AppleHealthKit.getStepCount(
      { startDate: startOfDay.toISOString(), endDate: now.toISOString() },
      (err: Error | null, result: { value?: number }) => {
        if (err || !result) { resolve(0); return; }
        resolve(Math.round(result.value ?? 0));
      }
    );
  });
}

export async function getRecentHeartRate(): Promise<number | undefined> {
  if (Platform.OS !== "ios" || !AppleHealthKit) return undefined;

  return new Promise((resolve) => {
    AppleHealthKit.getHeartRateSamples(
      { limit: 1, ascending: false },
      (err: Error | null, results: any[]) => {
        if (err || !results?.length) { resolve(undefined); return; }
        resolve(Math.round(results[0].value ?? 0));
      }
    );
  });
}

export async function getBodyWeight(): Promise<number | undefined> {
  if (Platform.OS !== "ios" || !AppleHealthKit) return undefined;

  return new Promise((resolve) => {
    AppleHealthKit.getLatestWeight(
      { unit: "gram" },
      (err: Error | null, result: { value?: number }) => {
        if (err || !result?.value) { resolve(undefined); return; }
        resolve(Math.round((result.value / 1000) * 10) / 10); // g → kg, 1dp
      }
    );
  });
}

export async function getDailyActivitySummary(): Promise<DailyActivitySummary> {
  const [calories, steps, heartRate, bodyWeight, recentWorkouts] =
    await Promise.all([
      getTodaysCaloriesBurned(),
      getTodaysSteps(),
      getRecentHeartRate(),
      getBodyWeight(),
      getWorkouts(3),
    ]);

  return {
    date: new Date().toISOString().split("T")[0],
    activeEnergyBurned: calories,
    steps,
    heartRateAvg: heartRate,
    bodyWeightKg: bodyWeight,
    recentWorkouts,
  };
}
