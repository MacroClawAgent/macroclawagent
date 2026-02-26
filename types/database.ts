// Shared TypeScript interfaces for MacroClawAgent database types.
// Imported by API routes and client pages to avoid duplication.

export interface ActivityRow {
  id: string;
  type: "Run" | "Ride" | "Swim" | "Other";
  name: string;
  started_at: string;
  duration_seconds: number;
  distance_meters: number;
  calories: number;
  elevation_meters: number | null;
  avg_heart_rate: number | null;
  pace_seconds_per_km: number | null;
  speed_kmh: number | null;
}

export interface MealItem {
  tag: string; // "Breakfast" | "Lunch" | "Snack" | "Dinner"
  name: string;
  description?: string;
  prep_time?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealPlanRow {
  id: string;
  date: string;
  label: string | null;
  activity_summary: string | null;
  status: "pending" | "built" | "ordered" | "delivered";
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  uber_checkout_url: string | null;
  meals: MealItem[];
}

export interface NutritionLog {
  date: string;
  calories_consumed: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  hydration_ml: number;
}

export interface UserGoals {
  calorie_goal: number;
  protein_goal: number;
  carbs_goal: number;
  fat_goal: number;
}

export interface WeeklyDay {
  date: string;
  day: string;
  kcal: number;
  target: number;
}

export interface AgentMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface AgentContext {
  today_calories: number;
  today_protein: number;
  calorie_goal: number;
  protein_goal: number;
  last_activity_name: string | null;
  last_activity_calories: number | null;
  last_activity_distance_m: number | null;
}
