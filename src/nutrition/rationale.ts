/**
 * Deterministic Rationale Generator
 * Pure function — zero LLM involvement.
 * Produces human-readable bullet points explaining macro targets.
 */

import { DailyTargets, NutritionPreference, TrainingDayFeature } from "../types/optimizer";

const GOAL_LABELS: Record<string, string> = {
  performance: "performance",
  cut: "fat loss",
  lean_bulk: "lean muscle gain",
};

const DIET_LABELS: Record<string, string> = {
  omnivore: "omnivore",
  veg: "vegetarian",
  vegan: "plant-based",
  pesc: "pescatarian",
};

export function generateRationale(
  preferences: NutritionPreference,
  targets: DailyTargets[],
  weight_kg: number | undefined,
  trainingFeatures: TrainingDayFeature[]
): string[] {
  const bullets: string[] = [];
  const goal = GOAL_LABELS[preferences.goal] ?? preferences.goal;
  const diet = DIET_LABELS[preferences.diet] ?? preferences.diet;

  // Goal overview
  bullets.push(
    `7-day plan optimised for ${goal} on a ${diet} diet with ${preferences.meals_per_day} meals per day.`
  );

  // Weight-based protein
  if (weight_kg) {
    const proteinRatio = (targets[0].protein_g / weight_kg).toFixed(1);
    bullets.push(
      `Protein set at ${proteinRatio}g/kg body weight (${targets[0].protein_g}g/day) to support ${goal}.`
    );
    bullets.push(
      `Fat floor at 0.6g/kg (${Math.round(weight_kg * 0.6)}g/day minimum) to preserve hormonal health.`
    );
  } else {
    bullets.push(`Protein target: ${targets[0].protein_g}g/day (default for ${goal} goal without body metrics).`);
  }

  // Calorie range
  const minCal = Math.min(...targets.map((t) => t.calories));
  const maxCal = Math.max(...targets.map((t) => t.calories));
  if (minCal === maxCal) {
    bullets.push(`Daily calorie target: ${minCal} kcal across all 7 days.`);
  } else {
    bullets.push(
      `Calories range ${minCal}–${maxCal} kcal, scaling with training load (rest days lower, hard sessions higher).`
    );
  }

  // High-intensity days
  const highIntensityDays = targets.filter((t) => {
    const f = trainingFeatures.find((f) => f.day_date === t.day_date);
    return f && f.intensity_score >= 7;
  });
  if (highIntensityDays.length > 0) {
    bullets.push(
      `${highIntensityDays.length} high-intensity day(s) get +500 kcal and pre/post workout carb timing guidance.`
    );
  }

  // Long run recovery
  const longRunDays = trainingFeatures.filter((f) => f.long_run_flag);
  if (longRunDays.length > 0) {
    bullets.push(
      `Long run days (+${longRunDays.length} this week) include an additional +200 kcal recovery buffer.`
    );
  }

  // Load trend
  const trend = trainingFeatures[0]?.load_trend;
  if (trend === 1) {
    bullets.push("Training load is trending up — carb targets are set slightly higher to support adaptation.");
  } else if (trend === -1) {
    bullets.push("Training load is tapering — calorie targets reflect reduced expenditure.");
  }

  // Budget + cooking time
  if (preferences.budget_level === "low") {
    bullets.push("Budget-friendly ingredients prioritised: oats, eggs, lentils, rice, and tuna featured heavily.");
  }
  if (preferences.cooking_time_level === "low") {
    bullets.push("Meals selected for minimal prep time (≤15 min) to fit a busy training schedule.");
  }

  // Allergies
  if (preferences.allergies.length > 0) {
    bullets.push(`All meals are free from: ${preferences.allergies.join(", ")}.`);
  }

  return bullets;
}
