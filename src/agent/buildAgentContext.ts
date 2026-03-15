/**
 * Agent Context Builder
 *
 * Assembles a rich, structured context object from live user data.
 * Called fresh on every agent request — no stale state.
 *
 * COMPLIANCE: No raw Strava data, tokens, or PII beyond display name.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export interface FullAgentContext {
  user: {
    firstName: string;
    weightKg: number | null;
    heightCm: number | null;
    calorieGoal: number;
    proteinGoal: number;
    carbsGoal: number;
    fatGoal: number;
  };
  today: {
    caloriesConsumed: number;
    caloriesTarget: number;
    caloriesRemaining: number;
    caloriePct: number;
    proteinConsumed: number;
    proteinTarget: number;
    proteinRemaining: number;
    proteinPct: number;
    carbsConsumed: number;
    fatConsumed: number;
    hydrationMl: number;
  };
  activity: {
    latestWorkout: {
      type: string;
      name: string;
      durationMin: number;
      kcal: number;
      distanceKm: number;
      intensityScore: number;
    } | null;
    weeklyWorkoutCount: number;
  };
  planning: {
    planExists: boolean;
  };
  preferences: {
    goal: string;
    diet: string;
    allergies: string[];
    budgetLevel: string;
    cookingTimeLevel: string;
    mealsPerDay: number;
  };
}

export async function buildAgentContext(
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>
): Promise<FullAgentContext> {
  const today = new Date().toISOString().split("T")[0];

  // 7 days ago for weekly count
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [
    userRes,
    nutritionRes,
    prefsRes,
    latestActivityRes,
    weeklyActivityRes,
    planRes,
  ] = await Promise.allSettled([
    supabase
      .from("users")
      .select("full_name,weight_kg,height_cm,calorie_goal,protein_goal,carbs_goal,fat_goal")
      .eq("id", userId)
      .single(),
    supabase
      .from("nutrition_logs")
      .select("calories_consumed,protein_g,carbs_g,fat_g,hydration_ml")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle(),
    supabase
      .from("nutrition_preferences")
      .select("goal,diet,allergies,budget_level,cooking_time_level,meals_per_day")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("activities")
      .select("type,name,duration_seconds,calories,distance_meters")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("activities")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("started_at", weekAgo),
    supabase
      .from("plan_outputs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .limit(1),
  ]);

  // User profile
  const userRow =
    userRes.status === "fulfilled" ? userRes.value.data : null;
  const calorieGoal = userRow?.calorie_goal ?? 2000;
  const proteinGoal = userRow?.protein_goal ?? 120;
  const carbsGoal = userRow?.carbs_goal ?? 250;
  const fatGoal = userRow?.fat_goal ?? 70;
  const firstName =
    (userRow?.full_name ?? "").split(" ")[0] || "there";

  // Today's nutrition
  const nutRow =
    nutritionRes.status === "fulfilled" ? nutritionRes.value.data : null;
  const caloriesConsumed = nutRow?.calories_consumed ?? 0;
  const proteinConsumed = Math.round(nutRow?.protein_g ?? 0);
  const carbsConsumed = Math.round(nutRow?.carbs_g ?? 0);
  const fatConsumed = Math.round(nutRow?.fat_g ?? 0);
  const hydrationMl = nutRow?.hydration_ml ?? 0;

  // Preferences
  const prefsRow =
    prefsRes.status === "fulfilled" ? prefsRes.value.data : null;

  // Latest activity
  const actRow =
    latestActivityRes.status === "fulfilled"
      ? latestActivityRes.value.data
      : null;
  const latestWorkout = actRow
    ? {
        type: actRow.type ?? "Workout",
        name: actRow.name ?? "Training session",
        durationMin: Math.round((actRow.duration_seconds ?? 0) / 60),
        kcal: actRow.calories ?? 0,
        distanceKm: Math.round(((actRow.distance_meters ?? 0) / 1000) * 10) / 10,
        intensityScore: 5, // default — training_day_features not queried here for speed
      }
    : null;

  const weeklyWorkoutCount =
    weeklyActivityRes.status === "fulfilled"
      ? (weeklyActivityRes.value.count ?? 0)
      : 0;

  // Plan existence
  const planExists =
    planRes.status === "fulfilled"
      ? (planRes.value.count ?? 0) > 0
      : false;

  return {
    user: {
      firstName,
      weightKg: userRow?.weight_kg ?? null,
      heightCm: userRow?.height_cm ?? null,
      calorieGoal,
      proteinGoal,
      carbsGoal,
      fatGoal,
    },
    today: {
      caloriesConsumed,
      caloriesTarget: calorieGoal,
      caloriesRemaining: Math.max(0, calorieGoal - caloriesConsumed),
      caloriePct: calorieGoal > 0 ? Math.round((caloriesConsumed / calorieGoal) * 100) : 0,
      proteinConsumed,
      proteinTarget: proteinGoal,
      proteinRemaining: Math.max(0, proteinGoal - proteinConsumed),
      proteinPct: proteinGoal > 0 ? Math.round((proteinConsumed / proteinGoal) * 100) : 0,
      carbsConsumed,
      fatConsumed,
      hydrationMl,
    },
    activity: {
      latestWorkout,
      weeklyWorkoutCount,
    },
    planning: {
      planExists,
    },
    preferences: {
      goal: prefsRow?.goal ?? "performance",
      diet: prefsRow?.diet ?? "omnivore",
      allergies: prefsRow?.allergies ?? [],
      budgetLevel: prefsRow?.budget_level ?? "med",
      cookingTimeLevel: prefsRow?.cooking_time_level ?? "med",
      mealsPerDay: prefsRow?.meals_per_day ?? 3,
    },
  };
}
