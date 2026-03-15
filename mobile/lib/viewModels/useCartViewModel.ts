import { useCallback, useEffect, useState } from "react";
import { Linking } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { apiGet, apiPost } from "../api";
import { getCache, setCache } from "../cache";
import type { NutritionLog, UserProfile } from "../../types";

const PLAN_CACHE_KEY = "cart_plan";
const PLAN_MAX_AGE_MS = 6 * 60 * 60 * 1000;

export interface CartMealOption {
  id?: string;
  name: string;
  tag: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  prepMin?: number;
  ingredients?: { name: string; grams: number }[];
  recipe_steps?: string[];
}

export interface CartPlan {
  meal_plan: Record<string, CartMealOption[]>;
  grocery_list?: { name: string; qty: number; unit: string }[];
  rationale?: string[];
}

export interface CartViewModel {
  plan: CartPlan | null;
  selectedDay: number;
  setSelectedDay: (d: number) => void;
  macroGoal: { label: string; consumed: number; target: number; ratio: number };
  mealOptions: CartMealOption[];
  generating: boolean;
  generatePlan: () => Promise<void>;
  openGroceryList: () => void;
  openUberEats: () => void;
  loading: boolean;
  refreshing: boolean;
  refresh: () => void;
}

export function useCartViewModel(): CartViewModel {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [plan, setPlan] = useState<CartPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [nutrition, setNutrition] = useState<NutritionLog | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const cached = !isRefresh ? getCache<CartPlan>(PLAN_CACHE_KEY, PLAN_MAX_AGE_MS) : null;
      const [planRes, nutritionRes] = await Promise.allSettled([
        cached ? Promise.resolve(cached) : apiGet<CartPlan>("/api/optimizer/create"),
        apiGet<{ log: NutritionLog }>("/api/nutrition/today"),
      ]);

      if (planRes.status === "fulfilled" && planRes.value) {
        setPlan(planRes.value);
        if (!cached) setCache(PLAN_CACHE_KEY, planRes.value);
      }
      if (nutritionRes.status === "fulfilled") {
        setNutrition(nutritionRes.value.log ?? null);
      }
    } catch {
      // keep state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const generatePlan = useCallback(async () => {
    setGenerating(true);
    try {
      const newPlan = await apiPost<CartPlan>("/api/optimizer/create", {});
      setPlan(newPlan);
      setCache(PLAN_CACHE_KEY, newPlan);
    } catch {
      // ignore
    } finally {
      setGenerating(false);
    }
  }, []);

  const openGroceryList = useCallback(() => {
    router.push("/meals/grocery-list" as any);
  }, [router]);

  const openUberEats = useCallback(() => {
    Linking.openURL("https://www.ubereats.com");
  }, []);

  // Get meals for the selected day
  const dayKeys = plan ? Object.keys(plan.meal_plan ?? {}) : [];
  const selectedDayKey = dayKeys[selectedDay] ?? dayKeys[0];
  const mealOptions: CartMealOption[] = plan?.meal_plan?.[selectedDayKey] ?? [];

  const proteinConsumed = nutrition?.protein_g ?? 0;
  const proteinTarget = userProfile?.protein_goal ?? 120;

  return {
    plan,
    selectedDay,
    setSelectedDay,
    macroGoal: {
      label: "Protein goal",
      consumed: proteinConsumed,
      target: proteinTarget,
      ratio: proteinTarget > 0 ? Math.min(1, proteinConsumed / proteinTarget) : 0,
    },
    mealOptions,
    generating,
    generatePlan,
    openGroceryList,
    openUberEats,
    loading,
    refreshing,
    refresh: () => fetchData(true),
  };
}
