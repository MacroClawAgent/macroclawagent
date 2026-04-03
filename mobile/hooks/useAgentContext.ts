import { useState, useEffect, useCallback } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { usePreferences } from './usePreferences';
import { useHealthKit } from './useHealthKit';
import { usePantry } from './usePantry';
import { apiGet } from '@/lib/api';
import { getPreferencesSummary } from '@/services/preferencesService';
import type { UserPreferences } from '@/types/preferences';
import type { PantryItem } from '@/services/pantryService';

export interface TrainingData {
  label: string;
  durationMin: number;
  caloriesBurned: number;
  type: 'strength' | 'cardio' | 'steps';
}

export interface WeekDayData {
  date: string;
  day: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  target: number;
}

export interface WeeklyHistory {
  days: WeekDayData[];
  weekSoFar: {
    daysLogged: number;
    totalKcal: number;
    totalProtein: number;
    cumulativeCalorieDelta: number;
    cumulativeProteinDelta: number;
  };
}

export interface AgentContextData {
  name: string;
  goal: string;
  targets: { calories: number; protein: number; carbs: number; fat: number };
  nutrition: {
    consumed: { calories: number; protein: number; carbs: number; fat: number } | null;
    remaining: { calories: number; protein: number; carbs: number; fat: number } | null;
    progressPct: number;
  };
  weeklyHistory: WeeklyHistory | null;
  recentDishes: string[];
  training: TrainingData | null;
  pantry: {
    items: PantryItem[];
    count: number;
    add: (name: string, source?: PantryItem['source'], photoUri?: string) => Promise<void>;
    remove: (id: string) => Promise<void>;
  };
  preferences: UserPreferences;
  hasAnyPreferences: boolean;
  completeOnboarding: () => void;
  refreshPreferences: () => void;
  prefTags: string[];
  isLoading: boolean;
  refresh: () => void;
}

export function useAgentContext(): AgentContextData {
  const { userProfile } = useAuth();
  const { preferences, hasAnyPreferences, completeOnboarding, refreshPreferences } = usePreferences();
  const { summary: hkSummary } = useHealthKit();
  const { items: pantryItems, add: addPantryItem, remove: removePantryItem } = usePantry();

  const [nutritionConsumed, setNutritionConsumed] = useState<{
    calories: number; protein: number; carbs: number; fat: number;
  } | null>(null);
  const [weeklyHistory, setWeeklyHistory] = useState<WeeklyHistory | null>(null);
  const [recentDishes, setRecentDishes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const targets = {
    calories: userProfile?.calorie_goal ?? 2000,
    protein:  userProfile?.protein_goal ?? 120,
    carbs:    userProfile?.carbs_goal ?? 250,
    fat:      userProfile?.fat_goal ?? 70,
  };

  const fetchNutrition = useCallback(async () => {
    try {
      const d = await apiGet<{
        today: { calories_consumed?: number; protein_g?: number; carbs_g?: number; fat_g?: number } | null;
        goals: { calorie_goal: number; protein_goal: number };
        weeklyCalories?: WeekDayData[];
      }>('/api/nutrition/today');

      // Today's consumed
      const t = d.today;
      if (t && t.calories_consumed != null) {
        setNutritionConsumed({
          calories: t.calories_consumed ?? 0,
          protein: t.protein_g ?? 0,
          carbs: t.carbs_g ?? 0,
          fat: t.fat_g ?? 0,
        });
      }

      // Weekly history
      const wc = d.weeklyCalories ?? [];
      if (wc.length > 0) {
        const logged = wc.filter(day => day.kcal > 0);
        const calTarget = d.goals?.calorie_goal ?? targets.calories;
        const proTarget = userProfile?.protein_goal ?? targets.protein;
        setWeeklyHistory({
          days: wc,
          weekSoFar: {
            daysLogged: logged.length,
            totalKcal: logged.reduce((s, day) => s + day.kcal, 0),
            totalProtein: logged.reduce((s, day) => s + day.protein, 0),
            cumulativeCalorieDelta: logged.reduce((s, day) => s + (day.kcal - calTarget), 0),
            cumulativeProteinDelta: logged.reduce((s, day) => s + (day.protein - proTarget), 0),
          },
        });
      }
      // Fetch recent dishes (logged in last 3 days) for variety
      try {
        const dr = await apiGet<{ dishes: { name: string; last_logged: string }[] }>('/api/nutrition/food-items?distinct=true');
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        const cutoff = threeDaysAgo.toISOString().split('T')[0];
        const recent = (dr.dishes ?? [])
          .filter(d => d.last_logged >= cutoff)
          .map(d => d.name);
        setRecentDishes(recent);
      } catch { /* ok */ }
    } catch {
      // No nutrition log yet
    }
    setIsLoading(false);
  }, [targets.calories, targets.protein, userProfile?.protein_goal]);

  useEffect(() => { fetchNutrition(); }, [fetchNutrition]);

  // Auto-refresh when food is logged from anywhere in the app
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('nutrition_updated', fetchNutrition);
    return () => sub.remove();
  }, [fetchNutrition]);

  const name = userProfile?.full_name?.split(' ')[0] ?? 'there';
  const goal = userProfile?.fitness_goal ?? 'Build Muscle';

  const consumed = nutritionConsumed;
  const remaining = consumed
    ? {
        calories: Math.max(0, targets.calories - consumed.calories),
        protein:  Math.max(0, targets.protein  - consumed.protein),
        carbs:    Math.max(0, targets.carbs    - consumed.carbs),
        fat:      Math.max(0, targets.fat      - consumed.fat),
      }
    : null;
  const progressPct = consumed && targets.calories > 0
    ? Math.min(100, Math.round((consumed.calories / targets.calories) * 100))
    : 0;

  let training: TrainingData | null = null;
  if (hkSummary) {
    const workout = hkSummary.recentWorkouts?.[0];
    if (workout && workout.durationMinutes > 5) {
      const actType = workout.activityType.toLowerCase();
      const type =
        actType.includes('run') || actType.includes('walk') || actType.includes('cycl') || actType.includes('swim')
          ? ('cardio' as const)
          : ('strength' as const);
      training = {
        label: `${workout.activityType} · ${Math.round(workout.durationMinutes)} min`,
        durationMin: Math.round(workout.durationMinutes),
        caloriesBurned: Math.round(workout.totalEnergyBurned),
        type,
      };
    } else if (hkSummary.steps > 3000) {
      training = {
        label: `${hkSummary.steps.toLocaleString()} steps today`,
        durationMin: 0,
        caloriesBurned: Math.round(hkSummary.activeEnergyBurned),
        type: 'steps',
      };
    }
  }

  const prefTags = getPreferencesSummary(preferences);

  return {
    name,
    goal,
    targets,
    nutrition: { consumed, remaining, progressPct },
    weeklyHistory,
    recentDishes,
    training,
    pantry: { items: pantryItems, count: pantryItems.length, add: addPantryItem, remove: removePantryItem },
    preferences,
    hasAnyPreferences,
    completeOnboarding,
    refreshPreferences,
    prefTags,
    isLoading,
    refresh: fetchNutrition,
  };
}
