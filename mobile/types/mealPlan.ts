import type { UserPreferences } from './preferences';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type PlanType = 'today' | 'week';
export type MealStatus = 'upcoming' | 'current' | 'logged';

export interface Meal {
  id: string;
  type: MealType;
  name: string;
  ingredients: string;
  ingredientsList: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  emoji: string;
  cookTime: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: MealStatus;
  isLogged: boolean;
  recipeSteps?: string[];
}

export interface DayPlan {
  date: string;
  dayLabel: string;
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snack: Meal;
  };
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  allIngredients: string[];
}

export interface MealPlan {
  id: string;
  type: PlanType;
  generatedAt: string;
  preferences: UserPreferences;
  days: DayPlan[];
  allIngredients: string[];
}

export type AgentScreenState = 'idle' | 'generating' | 'plan_ready' | 'cart_sent';
