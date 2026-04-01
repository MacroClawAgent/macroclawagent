import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import type { DayPlan, Meal, MealType, AgentScreenState } from '@/types/mealPlan';
import type { UserPreferences } from '@/types/preferences';
import type { PantryItem } from '@/services/pantryService';
import { generateMealPlan, generateSingleMeal } from '@/services/mealGenerationService';
import { consolidateIngredients } from '@/services/ingredientConsolidationService';
import { loadPantryItems, importFromSmartCart } from '@/services/pantryService';

const PLAN_STORAGE_KEY = 'jonno_meal_plan';
const HISTORY_KEY = 'jonno_meal_plan_history';

async function saveMealToHistory(meal: Meal) {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  const history = raw ? JSON.parse(raw) : [];
  history.unshift({
    name: meal.name,
    emoji: meal.emoji,
    type: meal.type,
    calories: meal.calories,
    protein: meal.protein,
    savedAt: new Date().toISOString(),
  });
  // Keep last 50
  if (history.length > 50) history.length = 50;
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  goal: string;
}

export const useMealPlan = () => {
  const router = useRouter();
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
        // Save to history
        saveMealToHistory(meal).catch(() => {});
      } else {
        const generated = await generateMealPlan(type, preferences, targets, opts?.pantryItems);
        setDays(generated);
        setState('plan_ready');
        await AsyncStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify({ type, days: generated }));
        // Save all meals to history
        for (const day of generated) {
          for (const m of Object.values(day.meals)) {
            if (m) saveMealToHistory(m).catch(() => {});
          }
        }
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

  const getAllIngredientsCount = useCallback((): number => {
    return [...new Set(days.flatMap(d => d.allIngredients))].length;
  }, [days]);

  const sendToCart = useCallback(async () => {
    // Build days array — for single meals, wrap singleMeal in a DayPlan
    const effectiveDays: DayPlan[] = days.length > 0
      ? days
      : singleMeal
        ? [{
            date: new Date().toISOString(),
            dayLabel: 'Today',
            meals: { [singleMeal.type]: singleMeal } as DayPlan['meals'],
            totalCalories: singleMeal.calories,
            totalProtein: singleMeal.protein,
            totalCarbs: singleMeal.carbs,
            totalFat: singleMeal.fat,
            allIngredients: singleMeal.ingredientsList ?? [],
          }]
        : [];

    if (effectiveDays.length === 0) return;

    try {
      const pantryItems = await loadPantryItems();
      const consolidated = consolidateIngredients(effectiveDays, pantryItems);
      // Build per-meal entries for the carts index
      const allMeals = effectiveDays.flatMap(d =>
        Object.values(d.meals).filter(Boolean).map((m: any) => ({
          name: m.name as string,
          ingredients: (m.ingredientsList ?? []) as string[],
          calories: m.calories as number,
          protein: m.protein as number,
        }))
      );

      // Save individual meal entries to carts index
      const now = new Date().toISOString();
      const indexRaw = await AsyncStorage.getItem('jonno_carts_index');
      const existingIndex = indexRaw ? JSON.parse(indexRaw) : [];
      const newEntries = allMeals.map((meal, i) => {
        const mealNameLower = meal.name.toLowerCase();
        const matched = allMeals.length === 1 ? consolidated : consolidated
          .filter(c => c.usedIn.some((u: string) => u.toLowerCase().includes(mealNameLower)));
        return {
          id: `${Date.now()}-${i}`,
          label: meal.name,
          source: 'agent' as const,
          ingredientCount: matched.length,
          estimatedTotal: matched.reduce((s, c) => s + (c.estimatedPrice ?? 0), 0),
          createdAt: now,
        };
      });
      const updatedIndex = [...newEntries, ...existingIndex].slice(0, 20);
      await AsyncStorage.setItem('jonno_carts_index', JSON.stringify(updatedIndex));

      // Save full cart data per meal so each can be loaded independently
      for (let i = 0; i < allMeals.length; i++) {
        const meal = allMeals[i];
        const mealNameLower = meal.name.toLowerCase();
        // Match by usedIn (contains meal name) or fall back to all for single meals
        const mealIngredients = (allMeals.length === 1 ? consolidated : consolidated
          .filter(c => c.usedIn.some((u: string) => u.toLowerCase().includes(mealNameLower)))
        ).map(c => ({
            id: c.id,
            name: c.name,
            quantity: c.totalQuantity,
            unit: c.unit,
            category: c.category === 'produce' ? 'vegetables' : c.category === 'pantry' || c.category === 'bakery' ? 'carbs' : c.category === 'frozen' ? 'other' : c.category,
            isChecked: false,
            woolworthsProducts: [],
            colesProducts: [],
            selectedProductId: null,
            isLoadingProducts: false,
            usedIn: c.usedIn,
            estimatedPrice: c.estimatedPrice,
            displayQuantity: c.displayQuantity,
          }));
        const cartData = {
          cart: {
            id: newEntries[i].id,
            createdAt: now,
            ingredients: mealIngredients,
            selectedStore: null,
            selectedNearbyStore: null,
            nearbyStores: [],
            estimatedTotal: 0,
            lastUpdated: now,
          },
          meta: { source: 'agent', planType, mealCount: 1, pantrySkipped: 0, generatedAt: now, label: meal.name },
        };
        await AsyncStorage.setItem(`jonno_cart_${newEntries[i].id}`, JSON.stringify(cartData));
      }

      // Auto-add to pantry
      const toBuyNames = consolidated.filter(i => !i.isInPantry).map(i => i.name);
      importFromSmartCart(toBuyNames).catch(() => {});
      Toast.show({
        type: 'success',
        text1: `${allMeals.length} meal${allMeals.length !== 1 ? 's' : ''} added to Smart Cart`,
        visibilityTime: 2000,
      });
    } catch {
      // consolidation failed — still navigate
    }
    router.push('/(tabs)/cart' as never);
  }, [days, singleMeal, planType, router]);

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
    getAllIngredientsCount,
    sendToCart,
    resetPlan,
    setSelectedDayIndex,
  };
};
