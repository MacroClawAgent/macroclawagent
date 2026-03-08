export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  date_of_birth: string | null;
  gender: "male" | "female" | "other" | "prefer_not_to_say" | null;
  unit_preference: "metric" | "imperial";
  calorie_goal: number;
  protein_goal: number;
  carbs_goal: number;
  fat_goal: number;
  profile_complete: boolean;
  strava_athlete_id: string | null;
  created_at: string;
}

export interface ActivityRow {
  id: string;
  type: "Run" | "Ride" | "Swim" | "Other";
  name: string;
  started_at: string;
  duration_seconds: number;
  distance_meters: number | null;
  calories: number | null;
  elevation_meters: number | null;
  avg_heart_rate: number | null;
  pace_seconds_per_km: number | null;
  speed_kmh: number | null;
}

export interface NutritionLog {
  date: string;
  calories_consumed: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  hydration_ml: number;
}

export interface MealItem {
  tag: "Breakfast" | "Lunch" | "Snack" | "Dinner";
  name: string;
  description?: string;
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
