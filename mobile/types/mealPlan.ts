import type { UserPreferences } from './preferences';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type PlanType = 'today' | 'week' | 'single';
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
  reason?: string;
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

export type IngredientCategory =
  | 'produce'
  | 'protein'
  | 'dairy'
  | 'pantry'
  | 'bakery'
  | 'frozen'
  | 'other';

export interface ConsolidatedIngredient {
  id: string;
  name: string;
  totalQuantity: number;
  unit: string;
  displayQuantity: string;
  category: IngredientCategory;
  usedIn: string[];
  isInPantry: boolean;
  estimatedPrice?: number;
  supermarketProduct?: string;
  store: 'woolworths' | 'coles';
  isChecked: boolean;
}

export interface AgentCartPayload {
  ingredients: ConsolidatedIngredient[];
  planType: 'today' | 'week' | 'single';
  mealCount: number;
  generatedAt: string;
}
