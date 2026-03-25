import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DayPlan, Meal, MealType, AgentScreenState } from '@/types/mealPlan';
import type { UserPreferences } from '@/types/preferences';
import type { PantryItem } from '@/services/pantryService';
import { generateMealPlan, generateSingleMeal } from '@/services/mealGenerationService';

const PLAN_STORAGE_KEY = 'jonno_meal_plan';

interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  goal: string;
}

export const useMealPlan = () => {
  const [state, setState]                     = useState<AgentScreenState>('idle');
  const [planType, setPlanType]               = useState<'today' | 'week' | 'single'>('today');
  const [days, setDays]                       = useState<DayPlan[]>([]);
  const [singleMeal, setSingleMeal]           = useState<Meal | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isRegenerating, setIsRegenerating]   = useState(false);
  const [error, setError]                     = useState<string | null>(null);

  const generate = useCallback(async (
    type: 'today' | 'week' | 'single',
    preferences: UserPreferences,
    targets: NutritionTargets,
    opts?: { mealType?: MealType; pantryItems?: PantryItem[] },
  ) => {
    setState('generating');
    setPlanType(type);
    setError(null);
    setSelectedDayIndex(0);
    try {
      if (type === 'single') {
        const meal = await generateSingleMeal(opts?.mealType ?? 'lunch', preferences, targets, opts?.pantryItems);
        setSingleMeal(meal);
        setState('plan_ready');
      } else {
        const generated = await generateMealPlan(type, preferences, targets, opts?.pantryItems);
        setDays(generated);
        setState('plan_ready');
        await AsyncStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify({ type, days: generated }));
      }
    } catch {
      setError('Could not generate plan. Please try again.');
      setState('idle');
    }
  }, []);

  const regenerate = useCallback(async (
    preferences: UserPreferences,
    targets: NutritionTargets,
    opts?: { mealType?: MealType; pantryItems?: PantryItem[] },
  ) => {
    setIsRegenerating(true);
    try {
      if (planType === 'single') {
        const meal = await generateSingleMeal(opts?.mealType ?? 'lunch', preferences, targets, opts?.pantryItems);
        setSingleMeal(meal);
      } else {
        const generated = await generateMealPlan(planType, preferences, targets, opts?.pantryItems);
        setDays(generated);
      }
    } finally {
      setIsRegenerating(false);
    }
  }, [planType]);

  const markMealLogged = useCallback((dayIndex: number, mealType: string) => {
    setDays(prev =>
      prev.map((day, i) => {
        if (i !== dayIndex) return day;
        const meal = day.meals[mealType as keyof typeof day.meals];
        return {
          ...day,
          meals: {
            ...day.meals,
            [mealType]: { ...meal, isLogged: true },
          },
        };
      }),
    );
  }, []);

  const getAllIngredients = useCallback((): string[] => {
    return [...new Set(days.flatMap(d => d.allIngredients))];
  }, [days]);

  const sendToCart = useCallback(() => {
    setState('cart_sent');
  }, []);

  const resetPlan = useCallback(() => {
    setState('idle');
    setDays([]);
    setSingleMeal(null);
    setError(null);
  }, []);

  return {
    state,
    planType,
    days,
    singleMeal,
    selectedDayIndex,
    isRegenerating,
    error,
    generate,
    regenerate,
    markMealLogged,
    getAllIngredients,
    sendToCart,
    resetPlan,
    setSelectedDayIndex,
  };
};
