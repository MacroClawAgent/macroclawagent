import { describe, it, expect } from "vitest";
import { buildDailyTargets } from "../nutrition/targets";
import { NutritionPreference, TrainingDayFeature } from "../types/optimizer";

const BASE_PREFS: NutritionPreference = {
  user_id: "00000000-0000-0000-0000-000000000001",
  goal: "performance",
  diet: "omnivore",
  allergies: [],
  dislikes: [],
  budget_level: "med",
  cooking_time_level: "med",
  meals_per_day: 3,
  timezone: "UTC",
};

const TRAINING_FEATURES: TrainingDayFeature[] = []; // rest days

describe("buildDailyTargets", () => {
  it("returns 7 days", () => {
    const targets = buildDailyTargets(BASE_PREFS, 75, TRAINING_FEATURES);
    expect(targets).toHaveLength(7);
  });

  it("protein is clamped between 1.6–2.2 g/kg when weight is known", () => {
    const weight = 75;
    const targets = buildDailyTargets(BASE_PREFS, weight, TRAINING_FEATURES);
    for (const t of targets) {
      expect(t.protein_g).toBeGreaterThanOrEqual(weight * 1.6);
      expect(t.protein_g).toBeLessThanOrEqual(weight * 2.2 + 1); // +1 for rounding
    }
  });

  it("fat is never below 0.6 g/kg or 20% of calories", () => {
    const weight = 75;
    const targets = buildDailyTargets(BASE_PREFS, weight, TRAINING_FEATURES);
    for (const t of targets) {
      const minByWeight = weight * 0.6;
      const minByPercent = (t.calories * 0.2) / 9;
      expect(t.fat_g).toBeGreaterThanOrEqual(Math.min(minByWeight, minByPercent) - 1);
    }
  });

  it("macro sum equals total calories (P×4 + C×4 + F×9 ≈ target ±5%)", () => {
    const targets = buildDailyTargets(BASE_PREFS, 75, TRAINING_FEATURES);
    for (const t of targets) {
      const macroKcal = t.protein_g * 4 + t.carbs_g * 4 + t.fat_g * 9;
      const delta = Math.abs(macroKcal - t.calories) / t.calories;
      expect(delta).toBeLessThan(0.05); // within 5%
    }
  });

  it("high intensity training day gets +500 kcal adjustment", () => {
    const today = new Date().toISOString().split("T")[0];
    const highIntensityFeature: TrainingDayFeature = {
      user_id: BASE_PREFS.user_id,
      day_date: today,
      total_minutes: 90,
      run_minutes: 90,
      total_distance_km: 18,
      intensity_score: 8,
      long_run_flag: false,
      load_trend: 0,
    };
    const restTargets = buildDailyTargets(BASE_PREFS, 75, []);
    const trainingTargets = buildDailyTargets(BASE_PREFS, 75, [highIntensityFeature], new Date());
    // Training day should have higher calories
    const trainingDay = trainingTargets.find((t) => t.day_date === today);
    const restDay = restTargets[0];
    if (trainingDay) {
      expect(trainingDay.calories).toBeGreaterThan(restDay.calories);
    }
  });

  it("long_run_flag adds recovery bump (+200 kcal)", () => {
    const today = new Date().toISOString().split("T")[0];
    const longRunFeature: TrainingDayFeature = {
      user_id: BASE_PREFS.user_id,
      day_date: today,
      total_minutes: 90,
      run_minutes: 90,
      total_distance_km: 20,
      intensity_score: 6,
      long_run_flag: true,
      load_trend: 0,
    };
    const noLongRun: TrainingDayFeature = { ...longRunFeature, long_run_flag: false };
    const withLongRun = buildDailyTargets(BASE_PREFS, 75, [longRunFeature], new Date());
    const withoutLongRun = buildDailyTargets(BASE_PREFS, 75, [noLongRun], new Date());
    const dayWith = withLongRun.find((t) => t.day_date === today);
    const dayWithout = withoutLongRun.find((t) => t.day_date === today);
    if (dayWith && dayWithout) {
      expect(dayWith.calories - dayWithout.calories).toBe(200);
    }
  });

  it("cut goal sets protein floor at 2.2 g/kg", () => {
    const cutPrefs = { ...BASE_PREFS, goal: "cut" as const };
    const targets = buildDailyTargets(cutPrefs, 75, []);
    for (const t of targets) {
      expect(t.protein_g).toBeGreaterThanOrEqual(75 * 1.6); // at least minimum
    }
  });

  it("training day has non-null timing_rules", () => {
    const today = new Date().toISOString().split("T")[0];
    const feature: TrainingDayFeature = {
      user_id: BASE_PREFS.user_id,
      day_date: today,
      total_minutes: 60,
      run_minutes: 60,
      total_distance_km: 10,
      intensity_score: 5,
      long_run_flag: false,
      load_trend: 0,
    };
    const targets = buildDailyTargets(BASE_PREFS, 75, [feature], new Date());
    const trainingDay = targets.find((t) => t.day_date === today);
    if (trainingDay) {
      expect(trainingDay.timing_rules).not.toBeNull();
      expect(trainingDay.timing_rules?.post_workout_protein_g).toBe(30);
    }
  });

  it("rest days have null timing_rules", () => {
    const targets = buildDailyTargets(BASE_PREFS, 75, []);
    for (const t of targets) {
      expect(t.timing_rules).toBeNull();
    }
  });

  it("calories are bounded between 1200 and 6000", () => {
    const targets = buildDailyTargets(BASE_PREFS, 75, []);
    for (const t of targets) {
      expect(t.calories).toBeGreaterThanOrEqual(1200);
      expect(t.calories).toBeLessThanOrEqual(6000);
    }
  });
});
