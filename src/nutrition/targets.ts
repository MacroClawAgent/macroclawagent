/**
 * Deterministic Nutrition Target Engine
 *
 * Computes daily calorie + macro targets based on:
 * - User preferences (goal, diet, meals/day)
 * - Body metrics (weight_kg if available)
 * - Training day features (intensity, long-run flag)
 *
 * ALL logic is deterministic math — no LLM involved.
 * Outputs are used as fixed constraints; the LLM may NOT override them.
 */

import {
  DailyTargets,
  NutritionPreference,
  TimingRules,
  TrainingDayFeature,
} from "../types/optimizer";

// ── Constants ────────────────────────────────────────────────

const PROTEIN_RATIO: Record<string, number> = {
  performance: 2.0,
  lean_bulk: 1.8,
  cut: 2.2,
};

const PROTEIN_DEFAULT_G: Record<string, number> = {
  performance: 160,
  lean_bulk: 150,
  cut: 170,
};

const BASE_CALORIES_DEFAULT: Record<string, number> = {
  performance: 2800,
  lean_bulk: 2600,
  cut: 2000,
};

// ── Base Calorie Calculator ───────────────────────────────────

function mifflinStJeor(weight_kg: number): number {
  // Simplified: assumes average height + age + moderate activity for athlete
  // Full Mifflin with average male athlete reference (70kg, 175cm, 28yo, male)
  // Adjusted proportionally by actual weight
  const bmrRef = 10 * 70 + 6.25 * 175 - 5 * 28 + 5; // 1698 kcal
  const bmrActual = (weight_kg / 70) * bmrRef;
  return Math.round(bmrActual * 1.55); // moderate activity multiplier
}

function baseCalories(
  goal: string,
  weight_kg: number | undefined
): number {
  if (weight_kg && weight_kg > 0) {
    const tdee = mifflinStJeor(weight_kg);
    if (goal === "cut") return Math.round(tdee * 0.85);
    if (goal === "lean_bulk") return Math.round(tdee * 1.1);
    return tdee; // performance = maintenance
  }
  return BASE_CALORIES_DEFAULT[goal] ?? 2500;
}

// ── Training Adjustment ───────────────────────────────────────

function trainingCalorieAdj(feature: TrainingDayFeature | undefined): number {
  if (!feature) return 0;
  let adj = 0;
  const { intensity_score, long_run_flag } = feature;
  if (intensity_score >= 7) adj += 500;
  else if (intensity_score >= 4) adj += 300;
  if (long_run_flag) adj += 200;
  return adj;
}

// ── Macro Calculator ──────────────────────────────────────────

function calcProtein(
  goal: string,
  weight_kg: number | undefined,
  totalCalories: number
): number {
  if (weight_kg && weight_kg > 0) {
    const ratio = PROTEIN_RATIO[goal] ?? 1.8;
    const raw = weight_kg * ratio;
    // Clamp: 1.6–2.2 g/kg
    const min = weight_kg * 1.6;
    const max = weight_kg * 2.2;
    return Math.round(Math.min(max, Math.max(min, raw)));
  }
  return PROTEIN_DEFAULT_G[goal] ?? 150;
}

function calcFat(
  weight_kg: number | undefined,
  totalCalories: number
): number {
  const minByWeight = weight_kg && weight_kg > 0 ? weight_kg * 0.6 : 0;
  const minByPercent = (totalCalories * 0.2) / 9;
  const standard = (totalCalories * 0.27) / 9;
  return Math.round(Math.max(minByWeight, minByPercent, standard));
}

function calcCarbs(totalCalories: number, protein_g: number, fat_g: number): number {
  const remaining = totalCalories - protein_g * 4 - fat_g * 9;
  return Math.round(Math.max(0, remaining / 4));
}

// ── Timing Rules ──────────────────────────────────────────────

function buildTimingRules(
  feature: TrainingDayFeature | undefined
): TimingRules {
  if (!feature || feature.intensity_score === 0) return null;
  return {
    pre_workout_carbs_g: Math.round(40 + feature.intensity_score * 2),
    post_workout_protein_g: 30,
    post_workout_carbs_g: 50,
  };
}

// ── Main Export ───────────────────────────────────────────────

/**
 * Build DailyTargets for a 7-day window starting from startDate.
 * Uses training features for matching days; rest days get base targets.
 */
export function buildDailyTargets(
  preferences: NutritionPreference,
  weight_kg: number | undefined,
  trainingFeatures: TrainingDayFeature[],
  startDate?: Date
): DailyTargets[] {
  const start = startDate ?? new Date();
  const featureMap = new Map(trainingFeatures.map((f) => [f.day_date, f]));

  const targets: DailyTargets[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const day_date = d.toISOString().split("T")[0];

    // Use same-day feature if available (for training days in range)
    // Otherwise use most recent feature as proxy for chronic load
    const feature = featureMap.get(day_date);

    const base = baseCalories(preferences.goal, weight_kg);
    const adj = trainingCalorieAdj(feature);
    const calories = Math.round(base + adj);

    const protein_g = calcProtein(preferences.goal, weight_kg, calories);
    const fat_g = calcFat(weight_kg, calories);
    const carbs_g = calcCarbs(calories, protein_g, fat_g);
    const timing_rules = buildTimingRules(feature);

    targets.push({ day_date, calories, protein_g, carbs_g, fat_g, timing_rules });
  }

  return targets;
}
