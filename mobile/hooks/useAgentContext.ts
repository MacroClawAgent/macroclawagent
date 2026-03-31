import { useState, useEffect, useCallback } from 'react';
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

export interface AgentContextData {
  name: string;
  goal: string;
  targets: { calories: number; protein: number; carbs: number; fat: number };
  nutrition: {
    consumed: { calories: number; protein: number; carbs: number; fat: number } | null;
    remaining: { calories: number; protein: number; carbs: number; fat: number } | null;
    progressPct: number;
  };
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
  prefTags: string[];
  isLoading: boolean;
  refresh: () => void;
}

export function useAgentContext(): AgentContextData {
  const { userProfile } = useAuth();
  const { preferences, hasAnyPreferences, completeOnboarding } = usePreferences();
  const { summary: hkSummary } = useHealthKit();
  const { items: pantryItems, add: addPantryItem, remove: removePantryItem } = usePantry();

  const [nutritionConsumed, setNutritionConsumed] = useState<{
    calories: number; protein: number; carbs: number; fat: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNutrition = useCallback(async () => {
    try {
      const d = await apiGet<{
        calories_consumed?: number; protein_g?: number; carbs_g?: number; fat_g?: number;
      }>('/api/nutrition/today');
      if (d.calories_consumed != null) {
        setNutritionConsumed({
          calories: d.calories_consumed ?? 0,
          protein: d.protein_g ?? 0,
          carbs: d.carbs_g ?? 0,
          fat: d.fat_g ?? 0,
        });
      }
    } catch {
      // No nutrition log yet — leave null
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchNutrition(); }, [fetchNutrition]);

  // Identity from userProfile with safe defaults
  const targets = {
    calories: userProfile?.calorie_goal ?? 2000,
    protein:  userProfile?.protein_goal ?? 120,
    carbs:    userProfile?.carbs_goal ?? 250,
    fat:      userProfile?.fat_goal ?? 70,
  };
  const name = userProfile?.full_name?.split(' ')[0] ?? 'there';
  const goal = userProfile?.fitness_goal ?? 'Build Muscle';

  // Nutrition context
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

  // Training data from HealthKit (iOS only, permission-gated)
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
    training,
    pantry: { items: pantryItems, count: pantryItems.length, add: addPantryItem, remove: removePantryItem },
    preferences,
    hasAnyPreferences,
    completeOnboarding,
    prefTags,
    isLoading,
    refresh: fetchNutrition,
  };
}
