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

function deriveInsight(
  profile: UserProfile,
  nutrition: NutritionLog | null
): { title: string; body: string } | undefined {
  if (!nutrition) return undefined;

  const proteinTarget = profile.protein_goal;
  const proteinGap = proteinTarget - nutrition.protein_g;
  if (proteinGap > 20) {
    return {
      title: "Jonno",
      body: `Protein ${Math.round(proteinGap)}g short today. Add grilled chicken or Greek yoghurt to hit your target. 🎯`,
    };
  }

  const calorieTarget = profile.calorie_goal;
  const calorieConsumed = nutrition.calories_consumed;
  if (calorieConsumed < calorieTarget * 0.5 && new Date().getHours() > 14) {
    return {
      title: "Jonno",
      body: `You're at ${Math.round((calorieConsumed / calorieTarget) * 100)}% of your calorie target. Time for a solid meal. 🍽`,
    };
  }

  const carbTarget = profile.carbs_goal;
  const carbGap = carbTarget - nutrition.carbs_g;
  if (carbGap > 60) {
    return {
      title: "Jonno",
      body: `Carbs are ${Math.round(carbGap)}g under target. Add rice or oats to fuel recovery. ⚡`,
    };
  }

  return {
    title: "Jonno",
    body: "You're on track today. Keep it consistent and stay hydrated. 💧",
  };
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

  return {
    greeting: greetingWord(),
    userName: profile?.full_name?.split(" ")[0] ?? "there",
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
    refresh: () => fetchData(true),
  };
}
