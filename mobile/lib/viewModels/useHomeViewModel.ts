import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiGet, apiPost } from "../api";
import { getCache, setCache } from "../cache";
import { greetingWord } from "../formatters";
import type { ActivityRow, NutritionLog, UserProfile } from "../../types";

const PLAN_CACHE_KEY = "home_optimizer";
const PLAN_MAX_AGE_MS = 6 * 60 * 60 * 1000;

export interface HomeViewModel {
  greeting: string;
  userName: string;
  goalLabel: string;
  goalEmoji: string;
  calorieProgress: { consumed: number; target: number; remaining: number; ratio: number };
  macros: {
    protein: { consumed: number; target: number; ratio: number };
    carbs: { consumed: number; target: number; ratio: number };
    fat: { consumed: number; target: number; ratio: number };
  };
  latestActivity?: {
    type: string;
    title: string;
    distanceKm: number;
    kcal: number;
    durationMin: number;
  };
  jonnoInsight?: { title: string; body: string };
  isStravaConnected: boolean;
  loading: boolean;
  refreshing: boolean;
  refresh: () => void;
}

const GOAL_META: Record<string, { label: string; emoji: string }> = {
  lose_weight:  { label: "Lose Weight",  emoji: "🔥" },
  build_muscle: { label: "Build Muscle", emoji: "💪" },
  performance:  { label: "Performance",  emoji: "🏃" },
  maintain:     { label: "Stay Healthy", emoji: "✅" },
};

function deriveInsight(
  profile: UserProfile,
  nutrition: NutritionLog | null
): { title: string; body: string } | undefined {
  if (!nutrition) return undefined;

  const goal = profile.fitness_goal ?? "maintain";
  const proteinTarget = profile.protein_goal;
  const proteinGap = proteinTarget - nutrition.protein_g;
  const calorieTarget = profile.calorie_goal;
  const calorieConsumed = nutrition.calories_consumed;
  const calPct = calorieTarget > 0 ? Math.round((calorieConsumed / calorieTarget) * 100) : 0;
  const carbTarget = profile.carbs_goal;
  const carbGap = carbTarget - nutrition.carbs_g;
  const hour = new Date().getHours();

  if (goal === "lose_weight") {
    // For fat loss: flag calorie overage or protein gaps (preserve muscle)
    if (calorieConsumed > calorieTarget * 1.05) {
      const over = Math.round(calorieConsumed - calorieTarget);
      return { title: "Jonno", body: `You're ${over} kcal over your deficit target today. Skip the late snack and you're good. 🔥` };
    }
    if (proteinGap > 20) {
      return { title: "Jonno", body: `${Math.round(proteinGap)}g protein still to go. High-protein meals protect muscle while you cut. Add cottage cheese or chicken. 💪` };
    }
    if (calPct < 40 && hour > 14) {
      return { title: "Jonno", body: `Only ${calPct}% of calories in by ${hour}:00. Eating too little slows your metabolism — have a proper meal. 🍽` };
    }
    return { title: "Jonno", body: `Deficit on track today. Stay consistent and hit your protein to protect lean mass. 🔥` };
  }

  if (goal === "build_muscle") {
    // For muscle gain: flag under-eating and low protein
    if (proteinGap > 20) {
      return { title: "Jonno", body: `${Math.round(proteinGap)}g protein left to hit your muscle-building target. Add a shake or Greek yoghurt. 💪` };
    }
    if (calorieConsumed < calorieTarget * 0.85 && hour > 14) {
      return { title: "Jonno", body: `You need a surplus to build — you're at ${calPct}% calories. Time for a big meal or extra snack. 🍽` };
    }
    if (carbGap > 60) {
      return { title: "Jonno", body: `${Math.round(carbGap)}g carbs under target. Carbs spare protein and fuel your lifts — add rice or oats. ⚡` };
    }
    return { title: "Jonno", body: `Solid day for muscle growth. Hit your final protein window before bed. 💪` };
  }

  if (goal === "performance") {
    // For athletes: focus on carb fueling and recovery
    if (carbGap > 60) {
      return { title: "Jonno", body: `Carbs ${Math.round(carbGap)}g under target. Fuelling matters for performance — add rice, pasta or oats. ⚡` };
    }
    if (proteinGap > 20) {
      return { title: "Jonno", body: `${Math.round(proteinGap)}g protein left — protein repairs muscle after training. Add chicken, eggs or a shake. 🏃` };
    }
    if (calorieConsumed < calorieTarget * 0.5 && hour > 14) {
      return { title: "Jonno", body: `Low energy intake by afternoon. Underfuelling hurts performance and recovery — eat up. 🍽` };
    }
    return { title: "Jonno", body: `Fuelling well today. Stay hydrated and get your post-workout carbs in. 💧` };
  }

  // maintain (default)
  if (proteinGap > 20) {
    return { title: "Jonno", body: `Protein ${Math.round(proteinGap)}g short today. Add grilled chicken or Greek yoghurt to hit your target. 🎯` };
  }
  if (calorieConsumed < calorieTarget * 0.5 && hour > 14) {
    return { title: "Jonno", body: `You're at ${calPct}% of your calorie target. Time for a solid meal. 🍽` };
  }
  if (carbGap > 60) {
    return { title: "Jonno", body: `Carbs are ${Math.round(carbGap)}g under target. Add rice or oats to fuel your day. ⚡` };
  }
  return { title: "Jonno", body: "You're on track today. Keep it consistent and stay hydrated. 💧" };
}

export function useHomeViewModel(): HomeViewModel {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nutrition, setNutrition] = useState<NutritionLog | null>(null);
  const [latestActivity, setLatestActivity] = useState<ActivityRow | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!userProfile) return;
    if (isRefresh) setRefreshing(true);

    try {
      const [nutritionRes, activityRes] = await Promise.allSettled([
        apiGet<{ log: NutritionLog; goals: UserProfile }>("/api/nutrition/today"),
        apiGet<{ activities: ActivityRow[] }>("/api/activities?limit=1"),
      ]);

      if (nutritionRes.status === "fulfilled") {
        setNutrition(nutritionRes.value.log ?? null);
      }
      if (activityRes.status === "fulfilled") {
        setLatestActivity(activityRes.value.activities?.[0] ?? null);
      }
    } catch {
      // keep previous state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userProfile]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const refresh = useCallback(() => { fetchData(true); }, [fetchData]);

  const profile = userProfile!;
  const cal = nutrition?.calories_consumed ?? 0;
  const calTarget = profile?.calorie_goal ?? 2000;
  const prot = nutrition?.protein_g ?? 0;
  const protTarget = profile?.protein_goal ?? 120;
  const carbs = nutrition?.carbs_g ?? 0;
  const carbTarget = profile?.carbs_goal ?? 250;
  const fat = nutrition?.fat_g ?? 0;
  const fatTarget = profile?.fat_goal ?? 70;

  const act = latestActivity
    ? {
        type: latestActivity.type,
        title: latestActivity.name,
        distanceKm: latestActivity.distance_meters
          ? latestActivity.distance_meters / 1000
          : 0,
        kcal: latestActivity.calories ?? 0,
        durationMin: Math.round(latestActivity.duration_seconds / 60),
      }
    : undefined;

  const fitnessGoal = profile?.fitness_goal ?? "maintain";
  const goalMeta = GOAL_META[fitnessGoal] ?? GOAL_META.maintain;

  return {
    greeting: greetingWord(),
    userName: profile?.full_name?.split(" ")[0] ?? "there",
    goalLabel: goalMeta.label,
    goalEmoji: goalMeta.emoji,
    calorieProgress: {
      consumed: cal,
      target: calTarget,
      remaining: Math.max(0, calTarget - cal),
      ratio: calTarget > 0 ? Math.min(1, cal / calTarget) : 0,
    },
    macros: {
      protein: { consumed: prot, target: protTarget, ratio: protTarget > 0 ? Math.min(1, prot / protTarget) : 0 },
      carbs: { consumed: carbs, target: carbTarget, ratio: carbTarget > 0 ? Math.min(1, carbs / carbTarget) : 0 },
      fat: { consumed: fat, target: fatTarget, ratio: fatTarget > 0 ? Math.min(1, fat / fatTarget) : 0 },
    },
    latestActivity: act,
    jonnoInsight: profile ? deriveInsight(profile, nutrition) : undefined,
    isStravaConnected: !!profile?.strava_athlete_id,
    loading,
    refreshing,
    refresh,
  };
}
