/**
 * Meal Optimizer — Stage 1: Greedy Heuristic
 *
 * Selects meal combinations from templates that best hit daily
 * macro targets within tolerance bounds.
 *
 * Stage 2 interface stub provided for future ILP upgrade.
 * TODO: Replace Stage 1 with highs-js or glpk.js for optimal solutions.
 */

import { computeMacros, INGREDIENTS } from "./ingredients";
import { MEAL_TEMPLATES, MealTemplate, MealTag } from "./templates";
import {
  DailyTargets,
  GroceryItem,
  MacroTotals,
  MealOptimized,
  NutritionPreference,
  OptimizationProblem,
  OptimizerBackend,
  PlanOutput,
} from "../types/optimizer";

// ── Tolerance Bounds ──────────────────────────────────────────

const TOLERANCES = {
  calories_pct: 0.10,  // ±10%
  protein_floor_pct: -0.05, // protein may not be more than 5% below target
  carbs_pct: 0.15,     // ±15%
  fat_pct: 0.15,       // ±15%
};

// ── Macro Computation ─────────────────────────────────────────

function computeTemplateMacros(template: MealTemplate): MacroTotals {
  let calories = 0, protein_g = 0, carbs_g = 0, fat_g = 0;
  for (const { id, grams } of template.ingredients) {
    const m = computeMacros(id, grams);
    calories += m.kcal;
    protein_g += m.protein_g;
    carbs_g += m.carbs_g;
    fat_g += m.fat_g;
  }
  return {
    calories: Math.round(calories),
    protein_g: Math.round(protein_g * 10) / 10,
    carbs_g: Math.round(carbs_g * 10) / 10,
    fat_g: Math.round(fat_g * 10) / 10,
  };
}

function sumMacros(meals: MacroTotals[]): MacroTotals {
  return meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein_g: acc.protein_g + m.protein_g,
      carbs_g: acc.carbs_g + m.carbs_g,
      fat_g: acc.fat_g + m.fat_g,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );
}

/** Squared deviation score — lower is better */
function deviationScore(total: MacroTotals, target: DailyTargets): number {
  const dCal = ((total.calories - target.calories) / target.calories) ** 2;
  const dPro = ((total.protein_g - target.protein_g) / target.protein_g) ** 2;
  const dCarb = ((total.carbs_g - target.carbs_g) / Math.max(1, target.carbs_g)) ** 2;
  const dFat = ((total.fat_g - target.fat_g) / Math.max(1, target.fat_g)) ** 2;
  return dCal * 2 + dPro * 3 + dCarb + dFat; // protein weighted higher
}

// ── Filtering ─────────────────────────────────────────────────

function isCompatible(
  template: MealTemplate,
  preferences: NutritionPreference
): boolean {
  // Diet check
  if (!template.diet_compat.includes(preferences.diet)) return false;

  // Allergy check
  const userAllergies = preferences.allergies.map((a) => a.toLowerCase());
  for (const allergen of template.exclude_if_allergy ?? []) {
    if (userAllergies.includes(allergen.toLowerCase())) return false;
  }

  // Dislike check — if any ingredient name is in dislikes, skip
  const dislikes = preferences.dislikes.map((d) => d.toLowerCase());
  for (const { id } of template.ingredients) {
    const ing = INGREDIENTS[id];
    if (ing && dislikes.some((d) => ing.name.toLowerCase().includes(d))) return false;
  }

  return true;
}

// ── Tag Distribution ──────────────────────────────────────────

function getMealTags(mealsPerDay: number): MealTag[] {
  if (mealsPerDay === 2) return ["Breakfast", "Dinner"];
  if (mealsPerDay === 3) return ["Breakfast", "Lunch", "Dinner"];
  if (mealsPerDay === 4) return ["Breakfast", "Lunch", "Dinner", "Snack"];
  if (mealsPerDay === 5) return ["Breakfast", "Lunch", "Dinner", "Snack", "Snack"];
  return ["Breakfast", "Snack", "Lunch", "Snack", "Dinner", "Snack"];
}

// ── Day Optimizer ─────────────────────────────────────────────

function pickMealsForDay(
  available: Map<MealTag, MealTemplate[]>,
  tags: MealTag[],
  target: DailyTargets,
  preferences: NutritionPreference,
  usedIds: Set<string>
): MealOptimized[] {
  // Greedy: pick best template per slot, try to minimise total deviation
  const selected: MealTemplate[] = [];

  for (const tag of tags) {
    const candidates = (available.get(tag) ?? []).filter(
      // Prefer variety — avoid repeating meals in the same week
      (t) => !usedIds.has(t.id)
    );
    const pool = candidates.length > 0 ? candidates : (available.get(tag) ?? []);

    // Sort by prep time if cooking_time_level is low
    let sorted = pool.slice();
    if (preferences.cooking_time_level === "low") {
      sorted.sort((a, b) => a.prep_min - b.prep_min);
    }

    // Pick lowest deviation contributor
    let best: MealTemplate | null = null;
    let bestScore = Infinity;

    for (const candidate of sorted) {
      const tentative = [...selected, candidate];
      const tentativeMacros = sumMacros(tentative.map(computeTemplateMacros));
      const score = deviationScore(tentativeMacros, target);
      if (score < bestScore) {
        bestScore = score;
        best = candidate;
      }
    }

    if (best) {
      selected.push(best);
      usedIds.add(best.id);
    }
  }

  // Convert to MealOptimized
  return selected.map((template) => {
    const macroTotals = computeTemplateMacros(template);
    return {
      id: template.id,
      tag: template.tag,
      name: template.name,
      ingredients: template.ingredients.map(({ id, grams }) => ({
        id,
        name: INGREDIENTS[id]?.name ?? id,
        grams,
      })),
      macro_totals: macroTotals,
      prep_time_min: template.prep_min,
    };
  });
}

// ── Grocery Aggregator ────────────────────────────────────────

function buildGroceryList(
  mealPlan: Record<string, MealOptimized[]>
): GroceryItem[] {
  const totals = new Map<string, { grams: number; name: string; category: string; unit: string }>();

  for (const meals of Object.values(mealPlan)) {
    for (const meal of meals) {
      for (const { id, grams } of meal.ingredients) {
        const existing = totals.get(id);
        const ing = INGREDIENTS[id];
        if (existing) {
          existing.grams += grams;
        } else {
          totals.set(id, {
            grams,
            name: ing?.name ?? id,
            category: ing?.category ?? "other",
            unit: ing?.unit ?? "g",
          });
        }
      }
    }
  }

  // Build grocery items with substitution suggestions
  return Array.from(totals.entries()).map(([id, { grams, name, category, unit }]) => {
    const ing = INGREDIENTS[id];
    const substitutions = findSubstitutions(id);
    return {
      name,
      qty: Math.ceil(grams / 10) * 10, // round up to nearest 10g
      unit,
      category: ing?.category ?? category,
      substitutions,
    };
  });
}

function findSubstitutions(ingredientId: string): string[] {
  const ing = INGREDIENTS[ingredientId];
  if (!ing) return [];
  // Same category, similar macros, different item
  return Object.values(INGREDIENTS)
    .filter(
      (other) =>
        other.id !== ingredientId &&
        other.category === ing.category &&
        Math.abs(other.protein_g - ing.protein_g) < 8 &&
        Math.abs(other.kcal - ing.kcal) < 80
    )
    .slice(0, 2)
    .map((other) => other.name);
}

// ── Main Optimizer ────────────────────────────────────────────

export function optimizePlan(
  preferences: NutritionPreference,
  dailyTargets: DailyTargets[],
  weight_kg?: number
): Omit<PlanOutput, "rationale" | "summary"> {
  // Build per-tag pools of compatible templates
  const tagPools = new Map<MealTag, MealTemplate[]>();
  for (const tag of ["Breakfast", "Lunch", "Dinner", "Snack"] as MealTag[]) {
    tagPools.set(
      tag,
      MEAL_TEMPLATES.filter((t) => t.tag === tag && isCompatible(t, preferences))
    );
  }

  const tags = getMealTags(preferences.meals_per_day);
  const mealPlan: Record<string, MealOptimized[]> = {};
  const usedIds = new Set<string>();

  for (const target of dailyTargets) {
    mealPlan[target.day_date] = pickMealsForDay(tagPools, tags, target, preferences, usedIds);
  }

  const grocery_list = buildGroceryList(mealPlan);

  return { targets: dailyTargets, meal_plan: mealPlan, grocery_list };
}

// ── Stage 2 Interface Stub ────────────────────────────────────
// TODO: Implement with highs-js (HIGHS ILP solver) or glpk.js
// Objective: min Σ(macro_delta²) + w_cost × cost_score + w_time × prep_time_score
// Subject to: diet_compat, allergy_exclusions, per_meal_calories ∈ [200, 800]

export class HeuristicOptimizer implements OptimizerBackend {
  optimize(problem: OptimizationProblem): PlanOutput {
    const { preferences, daily_targets, weight_kg } = problem;
    const result = optimizePlan(preferences, daily_targets, weight_kg);
    return { ...result, rationale: [], summary: undefined };
  }
}
