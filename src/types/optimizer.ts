import { z } from "zod";

// ── Training Day Features ─────────────────────────────────────
// Mirrors training_day_features DB schema exactly.
// Only these 7 fields may be stored from Strava signal processing.

export const TrainingDayFeatureSchema = z.object({
  user_id: z.string().uuid(),
  day_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  total_minutes: z.number().int().min(0),
  run_minutes: z.number().int().min(0),
  total_distance_km: z.number().min(0),
  intensity_score: z.number().int().min(0).max(10),
  long_run_flag: z.boolean(),
  load_trend: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
});
export type TrainingDayFeature = z.infer<typeof TrainingDayFeatureSchema>;

// ── Nutrition Preferences ─────────────────────────────────────

export const GoalEnum = z.enum(["performance", "cut", "lean_bulk"]);
export const DietEnum = z.enum(["omnivore", "veg", "vegan", "pesc"]);
export const BudgetLevelEnum = z.enum(["low", "med", "high"]);
export const CookingTimeLevelEnum = z.enum(["low", "med", "high"]);

export const NutritionPreferenceSchema = z.object({
  user_id: z.string().uuid(),
  goal: GoalEnum.default("performance"),
  diet: DietEnum.default("omnivore"),
  allergies: z.array(z.string()).default([]),
  dislikes: z.array(z.string()).default([]),
  budget_level: BudgetLevelEnum.default("med"),
  cooking_time_level: CookingTimeLevelEnum.default("med"),
  meals_per_day: z.number().int().min(2).max(6).default(3),
  timezone: z.string().default("UTC"),
});
export type NutritionPreference = z.infer<typeof NutritionPreferenceSchema>;

// ── Daily Targets ─────────────────────────────────────────────

export const TimingRulesSchema = z.object({
  pre_workout_carbs_g: z.number().min(0),
  post_workout_protein_g: z.number().min(0),
  post_workout_carbs_g: z.number().min(0),
}).nullable();

export const DailyTargetsSchema = z.object({
  day_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  calories: z.number().int().min(1200).max(6000),
  protein_g: z.number().min(0),
  carbs_g: z.number().min(0),
  fat_g: z.number().min(0),
  timing_rules: TimingRulesSchema,
});
export type DailyTargets = z.infer<typeof DailyTargetsSchema>;
export type TimingRules = z.infer<typeof TimingRulesSchema>;

// ── Meal Optimizer ────────────────────────────────────────────

export const IngredientUsageSchema = z.object({
  id: z.string(),
  name: z.string(),
  grams: z.number().positive(),
});
export type IngredientUsage = z.infer<typeof IngredientUsageSchema>;

export const MacroTotalsSchema = z.object({
  calories: z.number().min(0),
  protein_g: z.number().min(0),
  carbs_g: z.number().min(0),
  fat_g: z.number().min(0),
});
export type MacroTotals = z.infer<typeof MacroTotalsSchema>;

export const MealTagEnum = z.enum(["Breakfast", "Lunch", "Dinner", "Snack"]);

export const MealOptimizedSchema = z.object({
  id: z.string(),
  tag: MealTagEnum,
  name: z.string(),
  ingredients: z.array(IngredientUsageSchema),
  macro_totals: MacroTotalsSchema,
  prep_time_min: z.number().int().min(0),
  recipe_steps: z.array(z.string()).optional(),
});
export type MealOptimized = z.infer<typeof MealOptimizedSchema>;

export const GroceryItemSchema = z.object({
  name: z.string(),
  qty: z.number().positive(),
  unit: z.string(),
  category: z.string(),
  substitutions: z.array(z.string()).default([]),
});
export type GroceryItem = z.infer<typeof GroceryItemSchema>;

export const PlanOutputSchema = z.object({
  targets: z.array(DailyTargetsSchema),
  meal_plan: z.record(z.string(), z.array(MealOptimizedSchema)), // date → meals
  grocery_list: z.array(GroceryItemSchema),
  rationale: z.array(z.string()),
  summary: z.string().optional(), // LLM-generated explanation
});
export type PlanOutput = z.infer<typeof PlanOutputSchema>;

// ── LLM Gateway I/O ───────────────────────────────────────────
// Zod strips unknown keys — raw Strava fields are silently dropped.

export const LLMRequestTypeEnum = z.enum(["recipe_steps", "explanation", "substitution"]);

export const LLMRequestSchema = z.object({
  request_type: LLMRequestTypeEnum,
  meals: z.array(MealOptimizedSchema),
  grocery_list: z.array(GroceryItemSchema),
  daily_targets: z.array(DailyTargetsSchema),
  preferences: NutritionPreferenceSchema.pick({
    goal: true, diet: true, allergies: true, dislikes: true,
    budget_level: true, cooking_time_level: true, meals_per_day: true,
  }),
  // No user_id, no tokens, no raw Strava data allowed here
}).strict();
export type LLMRequest = z.infer<typeof LLMRequestSchema>;

export const LLMResponseSchema = z.object({
  recipe_steps: z.record(z.string(), z.array(z.string())).optional(),
  summary: z.string().optional(),
  substitutions: z.array(z.object({
    meal_id: z.string(),
    original_ingredient: z.string(),
    substitute: z.string(),
    macro_delta: MacroTotalsSchema,
  })).optional(),
});
export type LLMResponse = z.infer<typeof LLMResponseSchema>;

// ── Adherence Feedback ────────────────────────────────────────

export const AdherenceFeedbackSchema = z.object({
  plan_id: z.string().uuid().optional(),
  day_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  completion_score: z.number().min(0).max(1),
  hunger_score: z.number().int().min(1).max(5),
  energy_score: z.number().int().min(1).max(5),
  meals_skipped: z.number().int().min(0).default(0),
  notes: z.string().optional(),
});
export type AdherenceFeedback = z.infer<typeof AdherenceFeedbackSchema>;

// ── Optimizer Interface (Stage 2 stub) ────────────────────────

export interface OptimizationProblem {
  preferences: NutritionPreference;
  daily_targets: DailyTargets[];
  weight_kg?: number;
}

export interface OptimizerBackend {
  // TODO: Replace heuristic with ILP solver (highs-js or glpk.js)
  // Objective: min Σ(macro_delta²) + w_cost × cost_score + w_time × prep_time_score
  // Constraints: diet flags, allergy exclusions, calorie bounds [200, 800] per meal
  optimize(problem: OptimizationProblem): PlanOutput;
}
