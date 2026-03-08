/**
 * Plan Creation Orchestrator
 *
 * Pipeline: fetch preferences → fetch training features → build targets
 *           → optimize meals → generate rationale → LLM enrichment → save
 *
 * COMPLIANCE:
 * - LLM receives ONLY: meals, grocery_list, daily_targets, preferences (no goal fields)
 * - No user_id, tokens, or raw Strava data is ever sent to the LLM
 * - Strava sync is triggered only to populate training_day_features in DB
 * - LLM failure is non-blocking — plan is saved with deterministic output only
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { buildDailyTargets } from "../nutrition/targets";
import { generateRationale } from "../nutrition/rationale";
import { optimizePlan } from "../optimizer/meal_optimizer";
import { callLLM } from "../llm/gateway";
import {
  NutritionPreference,
  PlanOutput,
  TrainingDayFeature,
} from "../types/optimizer";

// Default preferences for new users
const DEFAULT_PREFERENCES: Omit<NutritionPreference, "user_id"> = {
  goal: "performance",
  diet: "omnivore",
  allergies: [],
  dislikes: [],
  budget_level: "med",
  cooking_time_level: "med",
  meals_per_day: 3,
  timezone: "UTC",
};

// ── Fetch helpers ─────────────────────────────────────────────

async function fetchPreferences(
  userId: string,
  supabase: SupabaseClient
): Promise<NutritionPreference> {
  const { data } = await supabase
    .from("nutrition_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (data) return data as NutritionPreference;

  // Upsert defaults if missing
  const defaults = { user_id: userId, ...DEFAULT_PREFERENCES };
  await supabase.from("nutrition_preferences").upsert(defaults, { onConflict: "user_id" });
  return defaults;
}

async function fetchTrainingFeatures(
  userId: string,
  supabase: SupabaseClient
): Promise<TrainingDayFeature[]> {
  const since = new Date();
  since.setDate(since.getDate() - 14);
  const sinceDate = since.toISOString().split("T")[0];

  const { data } = await supabase
    .from("training_day_features")
    .select("*")
    .eq("user_id", userId)
    .gte("day_date", sinceDate)
    .order("day_date", { ascending: false });

  return (data ?? []) as TrainingDayFeature[];
}

async function fetchUserWeight(
  userId: string,
  supabase: SupabaseClient
): Promise<number | undefined> {
  const { data } = await supabase
    .from("users")
    .select("weight_kg")
    .eq("id", userId)
    .single();
  return data?.weight_kg ?? undefined;
}

// ── Main Pipeline ─────────────────────────────────────────────

export async function createPlan(
  userId: string,
  supabase: SupabaseClient
): Promise<PlanOutput & { id?: string; start_date?: string; end_date?: string }> {
  // 1. Fetch preferences
  const preferences = await fetchPreferences(userId, supabase);

  // 2. Fetch training features (last 14 days)
  let trainingFeatures = await fetchTrainingFeatures(userId, supabase);

  // If too few rows, trigger Strava sync via internal call
  if (trainingFeatures.length < 3) {
    try {
      const { data: syncData } = await supabase.functions.invoke("strava-sync", {
        body: { user_id: userId },
      });
      if (syncData) {
        trainingFeatures = await fetchTrainingFeatures(userId, supabase);
      }
    } catch {
      // Sync failed — proceed with empty features (rest-day defaults)
    }
  }

  // 3. Fetch weight for accurate macro calculation
  const weight_kg = await fetchUserWeight(userId, supabase);

  // 4. Build deterministic daily targets for next 7 days
  const dailyTargets = buildDailyTargets(preferences, weight_kg, trainingFeatures);

  // 5. Run heuristic meal optimizer
  const { meal_plan, grocery_list } = optimizePlan(preferences, dailyTargets, weight_kg);

  // Flatten all meals for LLM context
  const allMeals = Object.values(meal_plan).flat();

  // 6. Generate deterministic rationale (no LLM)
  const rationale = generateRationale(preferences, dailyTargets, weight_kg, trainingFeatures);

  // 7. LLM enrichment — recipe steps
  // COMPLIANCE: only meals, grocery_list, targets, and non-identifying preferences are sent
  let recipeSteps: Record<string, string[]> = {};
  let summary: string | undefined;

  const llmRecipeResult = await callLLM({
    request_type: "recipe_steps",
    meals: allMeals,
    grocery_list,
    daily_targets: dailyTargets,
    preferences: {
      goal: preferences.goal,
      diet: preferences.diet,
      allergies: preferences.allergies,
      dislikes: preferences.dislikes,
      budget_level: preferences.budget_level,
      cooking_time_level: preferences.cooking_time_level,
      meals_per_day: preferences.meals_per_day,
    },
  });

  if (llmRecipeResult?.recipe_steps) {
    recipeSteps = llmRecipeResult.recipe_steps;
  }

  // 8. LLM enrichment — plan explanation
  const llmExplanationResult = await callLLM({
    request_type: "explanation",
    meals: allMeals,
    grocery_list,
    daily_targets: dailyTargets,
    preferences: {
      goal: preferences.goal,
      diet: preferences.diet,
      allergies: preferences.allergies,
      dislikes: preferences.dislikes,
      budget_level: preferences.budget_level,
      cooking_time_level: preferences.cooking_time_level,
      meals_per_day: preferences.meals_per_day,
    },
  });

  if (llmExplanationResult?.summary) {
    summary = llmExplanationResult.summary;
  }

  // 9. Merge recipe steps into meal plan
  const enrichedMealPlan = Object.fromEntries(
    Object.entries(meal_plan).map(([date, meals]) => [
      date,
      meals.map((meal) => ({
        ...meal,
        recipe_steps: recipeSteps[meal.id] ?? [],
      })),
    ])
  );

  // 10. Save to plan_outputs
  const startDate = dailyTargets[0]?.day_date;
  const endDate = dailyTargets[dailyTargets.length - 1]?.day_date;

  const planRecord = {
    user_id: userId,
    start_date: startDate,
    end_date: endDate,
    targets: dailyTargets,
    meal_plan: enrichedMealPlan,
    grocery_list,
    rationale,
  };

  const { data: savedPlan } = await supabase
    .from("plan_outputs")
    .insert(planRecord)
    .select("id, created_at")
    .single();

  return {
    targets: dailyTargets,
    meal_plan: enrichedMealPlan,
    grocery_list,
    rationale,
    summary,
    id: savedPlan?.id,
    start_date: startDate,
    end_date: endDate,
  };
}
