/**
 * Meal Templates Library
 * Named meal blueprints with ingredients, tags, and diet compatibility.
 */

import { DietType } from "./ingredients";

export type MealTag = "Breakfast" | "Lunch" | "Dinner" | "Snack";

export interface TemplateIngredient {
  id: string;   // ingredient ID from ingredients.ts
  grams: number;
}

export interface MealTemplate {
  id: string;
  tag: MealTag;
  name: string;
  ingredients: TemplateIngredient[];
  prep_min: number;
  diet_compat: DietType[];
  exclude_if_allergy?: string[]; // allergen tags that disqualify this meal
}

export const MEAL_TEMPLATES: MealTemplate[] = [
  // ── Breakfasts ────────────────────────────────────────────
  {
    id: "protein_oats",
    tag: "Breakfast",
    name: "Protein Oats",
    ingredients: [
      { id: "oats", grams: 80 },
      { id: "greek_yogurt", grams: 150 },
      { id: "berries", grams: 100 },
    ],
    prep_min: 5,
    diet_compat: ["omnivore", "veg", "pesc"],
    exclude_if_allergy: ["gluten", "dairy"],
  },
  {
    id: "vegan_oats",
    tag: "Breakfast",
    name: "Peanut Butter Oats",
    ingredients: [
      { id: "oats", grams: 90 },
      { id: "peanut_butter", grams: 20 },
      { id: "banana", grams: 100 },
    ],
    prep_min: 5,
    diet_compat: ["omnivore", "veg", "vegan", "pesc"],
    exclude_if_allergy: ["gluten", "nuts"],
  },
  {
    id: "scrambled_eggs",
    tag: "Breakfast",
    name: "Scrambled Eggs on Toast",
    ingredients: [
      { id: "eggs", grams: 180 },
      { id: "bread", grams: 80 },
      { id: "spinach", grams: 50 },
      { id: "olive_oil", grams: 8 },
    ],
    prep_min: 8,
    diet_compat: ["omnivore", "veg", "pesc"],
    exclude_if_allergy: ["eggs", "gluten"],
  },
  {
    id: "cottage_cheese_bowl",
    tag: "Breakfast",
    name: "Cottage Cheese & Berries",
    ingredients: [
      { id: "cottage_cheese", grams: 200 },
      { id: "berries", grams: 120 },
      { id: "oats", grams: 40 },
    ],
    prep_min: 3,
    diet_compat: ["omnivore", "veg", "pesc"],
    exclude_if_allergy: ["dairy", "gluten"],
  },
  {
    id: "protein_shake_banana",
    tag: "Breakfast",
    name: "Protein Shake & Banana",
    ingredients: [
      { id: "whey_protein", grams: 35 },
      { id: "milk", grams: 300 },
      { id: "banana", grams: 120 },
      { id: "oats", grams: 40 },
    ],
    prep_min: 3,
    diet_compat: ["omnivore", "veg", "pesc"],
    exclude_if_allergy: ["dairy", "gluten"],
  },
  {
    id: "tofu_scramble",
    tag: "Breakfast",
    name: "Tofu Scramble",
    ingredients: [
      { id: "tofu", grams: 200 },
      { id: "spinach", grams: 80 },
      { id: "bread", grams: 80 },
      { id: "olive_oil", grams: 10 },
    ],
    prep_min: 10,
    diet_compat: ["omnivore", "veg", "vegan", "pesc"],
    exclude_if_allergy: ["soy", "gluten"],
  },

  // ── Lunches ───────────────────────────────────────────────
  {
    id: "chicken_rice_bowl",
    tag: "Lunch",
    name: "Chicken & Rice Bowl",
    ingredients: [
      { id: "chicken_breast", grams: 180 },
      { id: "rice", grams: 200 },
      { id: "broccoli", grams: 100 },
      { id: "olive_oil", grams: 10 },
    ],
    prep_min: 25,
    diet_compat: ["omnivore", "pesc"],
    exclude_if_allergy: [],
  },
  {
    id: "tuna_pasta",
    tag: "Lunch",
    name: "Tuna Pasta",
    ingredients: [
      { id: "tuna", grams: 150 },
      { id: "pasta", grams: 200 },
      { id: "spinach", grams: 60 },
      { id: "olive_oil", grams: 12 },
    ],
    prep_min: 15,
    diet_compat: ["omnivore", "pesc"],
    exclude_if_allergy: ["fish", "gluten"],
  },
  {
    id: "lentil_bowl",
    tag: "Lunch",
    name: "Spiced Lentil Bowl",
    ingredients: [
      { id: "lentils", grams: 250 },
      { id: "rice", grams: 150 },
      { id: "spinach", grams: 80 },
      { id: "olive_oil", grams: 8 },
    ],
    prep_min: 20,
    diet_compat: ["omnivore", "veg", "vegan", "pesc"],
    exclude_if_allergy: [],
  },
  {
    id: "salmon_quinoa",
    tag: "Lunch",
    name: "Salmon & Quinoa",
    ingredients: [
      { id: "salmon", grams: 150 },
      { id: "quinoa", grams: 180 },
      { id: "broccoli", grams: 100 },
      { id: "olive_oil", grams: 8 },
    ],
    prep_min: 20,
    diet_compat: ["omnivore", "pesc"],
    exclude_if_allergy: ["fish"],
  },
  {
    id: "chickpea_salad",
    tag: "Lunch",
    name: "Chickpea Salad",
    ingredients: [
      { id: "chickpeas", grams: 200 },
      { id: "quinoa", grams: 150 },
      { id: "spinach", grams: 80 },
      { id: "olive_oil", grams: 15 },
    ],
    prep_min: 10,
    diet_compat: ["omnivore", "veg", "vegan", "pesc"],
    exclude_if_allergy: [],
  },
  {
    id: "tofu_stir_fry",
    tag: "Lunch",
    name: "Tofu Stir Fry & Rice",
    ingredients: [
      { id: "tofu", grams: 200 },
      { id: "rice", grams: 200 },
      { id: "broccoli", grams: 120 },
      { id: "olive_oil", grams: 10 },
    ],
    prep_min: 15,
    diet_compat: ["omnivore", "veg", "vegan", "pesc"],
    exclude_if_allergy: ["soy"],
  },

  // ── Dinners ───────────────────────────────────────────────
  {
    id: "beef_pasta",
    tag: "Dinner",
    name: "Lean Beef Pasta",
    ingredients: [
      { id: "beef_mince", grams: 150 },
      { id: "pasta", grams: 220 },
      { id: "spinach", grams: 80 },
      { id: "olive_oil", grams: 10 },
    ],
    prep_min: 20,
    diet_compat: ["omnivore"],
    exclude_if_allergy: ["gluten"],
  },
  {
    id: "chicken_sweet_potato",
    tag: "Dinner",
    name: "Chicken & Sweet Potato",
    ingredients: [
      { id: "chicken_breast", grams: 200 },
      { id: "sweet_potato", grams: 250 },
      { id: "broccoli", grams: 120 },
      { id: "olive_oil", grams: 12 },
    ],
    prep_min: 45,
    diet_compat: ["omnivore", "pesc"],
    exclude_if_allergy: [],
  },
  {
    id: "salmon_rice_dinner",
    tag: "Dinner",
    name: "Baked Salmon & Rice",
    ingredients: [
      { id: "salmon", grams: 200 },
      { id: "rice", grams: 200 },
      { id: "broccoli", grams: 120 },
      { id: "olive_oil", grams: 10 },
    ],
    prep_min: 25,
    diet_compat: ["omnivore", "pesc"],
    exclude_if_allergy: ["fish"],
  },
  {
    id: "lentil_curry",
    tag: "Dinner",
    name: "Lentil Curry & Rice",
    ingredients: [
      { id: "lentils", grams: 300 },
      { id: "rice", grams: 180 },
      { id: "spinach", grams: 80 },
      { id: "olive_oil", grams: 10 },
    ],
    prep_min: 25,
    diet_compat: ["omnivore", "veg", "vegan", "pesc"],
    exclude_if_allergy: [],
  },
  {
    id: "tofu_sweet_potato",
    tag: "Dinner",
    name: "Tofu & Sweet Potato Bake",
    ingredients: [
      { id: "tofu", grams: 250 },
      { id: "sweet_potato", grams: 250 },
      { id: "broccoli", grams: 120 },
      { id: "olive_oil", grams: 12 },
    ],
    prep_min: 45,
    diet_compat: ["omnivore", "veg", "vegan", "pesc"],
    exclude_if_allergy: ["soy"],
  },
  {
    id: "egg_fried_rice",
    tag: "Dinner",
    name: "Egg Fried Rice",
    ingredients: [
      { id: "eggs", grams: 150 },
      { id: "rice", grams: 220 },
      { id: "broccoli", grams: 100 },
      { id: "olive_oil", grams: 12 },
    ],
    prep_min: 15,
    diet_compat: ["omnivore", "veg", "pesc"],
    exclude_if_allergy: ["eggs"],
  },

  // ── Snacks ────────────────────────────────────────────────
  {
    id: "greek_yogurt_snack",
    tag: "Snack",
    name: "Greek Yogurt",
    ingredients: [
      { id: "greek_yogurt", grams: 150 },
      { id: "berries", grams: 80 },
    ],
    prep_min: 1,
    diet_compat: ["omnivore", "veg", "pesc"],
    exclude_if_allergy: ["dairy"],
  },
  {
    id: "banana_peanut_butter",
    tag: "Snack",
    name: "Banana & Peanut Butter",
    ingredients: [
      { id: "banana", grams: 120 },
      { id: "peanut_butter", grams: 30 },
    ],
    prep_min: 1,
    diet_compat: ["omnivore", "veg", "vegan", "pesc"],
    exclude_if_allergy: ["nuts"],
  },
  {
    id: "almonds_snack",
    tag: "Snack",
    name: "Almonds",
    ingredients: [
      { id: "almonds", grams: 40 },
    ],
    prep_min: 0,
    diet_compat: ["omnivore", "veg", "vegan", "pesc"],
    exclude_if_allergy: ["nuts"],
  },
  {
    id: "protein_shake_snack",
    tag: "Snack",
    name: "Protein Shake",
    ingredients: [
      { id: "whey_protein", grams: 30 },
      { id: "milk", grams: 250 },
    ],
    prep_min: 2,
    diet_compat: ["omnivore", "veg", "pesc"],
    exclude_if_allergy: ["dairy"],
  },
  {
    id: "cottage_cheese_snack",
    tag: "Snack",
    name: "Cottage Cheese",
    ingredients: [
      { id: "cottage_cheese", grams: 150 },
      { id: "berries", grams: 80 },
    ],
    prep_min: 1,
    diet_compat: ["omnivore", "veg", "pesc"],
    exclude_if_allergy: ["dairy"],
  },
];
