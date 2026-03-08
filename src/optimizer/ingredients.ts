/**
 * Ingredient Library
 * Per-100g macros, cost tier, prep time, and diet compatibility.
 */

export type DietType = "omnivore" | "veg" | "vegan" | "pesc";
export type CostTier = "low" | "med" | "high";
export type Category = "protein" | "carb" | "fat" | "vegetable" | "fruit" | "dairy";

export interface Ingredient {
  id: string;
  name: string;
  /** Per 100g values */
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  cost_tier: CostTier;
  prep_min: number; // base prep time in minutes
  diet: DietType[];
  category: Category;
  unit: string;    // "g" for most, "ml" for liquids
  allergens: string[];
}

export const INGREDIENTS: Record<string, Ingredient> = {
  chicken_breast: {
    id: "chicken_breast", name: "Chicken Breast", kcal: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6,
    cost_tier: "med", prep_min: 20, diet: ["omnivore", "pesc"], category: "protein",
    unit: "g", allergens: [],
  },
  eggs: {
    id: "eggs", name: "Eggs", kcal: 155, protein_g: 13, carbs_g: 1.1, fat_g: 11,
    cost_tier: "low", prep_min: 5, diet: ["omnivore", "veg", "pesc"], category: "protein",
    unit: "g", allergens: ["eggs"],
  },
  greek_yogurt: {
    id: "greek_yogurt", name: "Greek Yogurt", kcal: 59, protein_g: 10, carbs_g: 3.6, fat_g: 0.4,
    cost_tier: "med", prep_min: 0, diet: ["omnivore", "veg", "pesc"], category: "dairy",
    unit: "g", allergens: ["dairy"],
  },
  oats: {
    id: "oats", name: "Rolled Oats", kcal: 389, protein_g: 17, carbs_g: 66, fat_g: 7,
    cost_tier: "low", prep_min: 5, diet: ["omnivore", "veg", "vegan", "pesc"], category: "carb",
    unit: "g", allergens: ["gluten"],
  },
  rice: {
    id: "rice", name: "White Rice (cooked)", kcal: 130, protein_g: 2.7, carbs_g: 28, fat_g: 0.3,
    cost_tier: "low", prep_min: 15, diet: ["omnivore", "veg", "vegan", "pesc"], category: "carb",
    unit: "g", allergens: [],
  },
  pasta: {
    id: "pasta", name: "Pasta (cooked)", kcal: 158, protein_g: 5.8, carbs_g: 31, fat_g: 0.9,
    cost_tier: "low", prep_min: 12, diet: ["omnivore", "veg", "vegan", "pesc"], category: "carb",
    unit: "g", allergens: ["gluten"],
  },
  tuna: {
    id: "tuna", name: "Tuna (canned)", kcal: 116, protein_g: 26, carbs_g: 0, fat_g: 1,
    cost_tier: "low", prep_min: 0, diet: ["omnivore", "pesc"], category: "protein",
    unit: "g", allergens: ["fish"],
  },
  tofu: {
    id: "tofu", name: "Firm Tofu", kcal: 76, protein_g: 8, carbs_g: 2, fat_g: 4.2,
    cost_tier: "med", prep_min: 10, diet: ["omnivore", "veg", "vegan", "pesc"], category: "protein",
    unit: "g", allergens: ["soy"],
  },
  lentils: {
    id: "lentils", name: "Lentils (cooked)", kcal: 116, protein_g: 9, carbs_g: 20, fat_g: 0.4,
    cost_tier: "low", prep_min: 20, diet: ["omnivore", "veg", "vegan", "pesc"], category: "protein",
    unit: "g", allergens: [],
  },
  banana: {
    id: "banana", name: "Banana", kcal: 89, protein_g: 1.1, carbs_g: 23, fat_g: 0.3,
    cost_tier: "low", prep_min: 0, diet: ["omnivore", "veg", "vegan", "pesc"], category: "fruit",
    unit: "g", allergens: [],
  },
  berries: {
    id: "berries", name: "Mixed Berries", kcal: 50, protein_g: 0.7, carbs_g: 12, fat_g: 0.3,
    cost_tier: "med", prep_min: 0, diet: ["omnivore", "veg", "vegan", "pesc"], category: "fruit",
    unit: "g", allergens: [],
  },
  spinach: {
    id: "spinach", name: "Spinach", kcal: 23, protein_g: 2.9, carbs_g: 3.6, fat_g: 0.4,
    cost_tier: "low", prep_min: 2, diet: ["omnivore", "veg", "vegan", "pesc"], category: "vegetable",
    unit: "g", allergens: [],
  },
  olive_oil: {
    id: "olive_oil", name: "Olive Oil", kcal: 884, protein_g: 0, carbs_g: 0, fat_g: 100,
    cost_tier: "med", prep_min: 0, diet: ["omnivore", "veg", "vegan", "pesc"], category: "fat",
    unit: "ml", allergens: [],
  },
  sweet_potato: {
    id: "sweet_potato", name: "Sweet Potato (baked)", kcal: 90, protein_g: 2, carbs_g: 21, fat_g: 0.1,
    cost_tier: "low", prep_min: 40, diet: ["omnivore", "veg", "vegan", "pesc"], category: "carb",
    unit: "g", allergens: [],
  },
  almonds: {
    id: "almonds", name: "Almonds", kcal: 579, protein_g: 21, carbs_g: 22, fat_g: 50,
    cost_tier: "high", prep_min: 0, diet: ["omnivore", "veg", "vegan", "pesc"], category: "fat",
    unit: "g", allergens: ["nuts"],
  },
  cottage_cheese: {
    id: "cottage_cheese", name: "Cottage Cheese", kcal: 98, protein_g: 11, carbs_g: 3.4, fat_g: 4.3,
    cost_tier: "med", prep_min: 0, diet: ["omnivore", "veg", "pesc"], category: "dairy",
    unit: "g", allergens: ["dairy"],
  },
  salmon: {
    id: "salmon", name: "Salmon Fillet", kcal: 208, protein_g: 20, carbs_g: 0, fat_g: 13,
    cost_tier: "high", prep_min: 15, diet: ["omnivore", "pesc"], category: "protein",
    unit: "g", allergens: ["fish"],
  },
  bread: {
    id: "bread", name: "Wholegrain Bread", kcal: 247, protein_g: 9, carbs_g: 47, fat_g: 3.4,
    cost_tier: "low", prep_min: 0, diet: ["omnivore", "veg", "vegan", "pesc"], category: "carb",
    unit: "g", allergens: ["gluten"],
  },
  milk: {
    id: "milk", name: "Whole Milk", kcal: 61, protein_g: 3.2, carbs_g: 4.8, fat_g: 3.3,
    cost_tier: "low", prep_min: 0, diet: ["omnivore", "veg", "pesc"], category: "dairy",
    unit: "ml", allergens: ["dairy"],
  },
  peanut_butter: {
    id: "peanut_butter", name: "Peanut Butter", kcal: 588, protein_g: 25, carbs_g: 20, fat_g: 50,
    cost_tier: "low", prep_min: 0, diet: ["omnivore", "veg", "vegan", "pesc"], category: "fat",
    unit: "g", allergens: ["nuts"],
  },
  broccoli: {
    id: "broccoli", name: "Broccoli", kcal: 34, protein_g: 2.8, carbs_g: 7, fat_g: 0.4,
    cost_tier: "low", prep_min: 8, diet: ["omnivore", "veg", "vegan", "pesc"], category: "vegetable",
    unit: "g", allergens: [],
  },
  beef_mince: {
    id: "beef_mince", name: "Lean Beef Mince (5% fat)", kcal: 137, protein_g: 21, carbs_g: 0, fat_g: 5,
    cost_tier: "med", prep_min: 15, diet: ["omnivore"], category: "protein",
    unit: "g", allergens: [],
  },
  chickpeas: {
    id: "chickpeas", name: "Chickpeas (canned)", kcal: 164, protein_g: 9, carbs_g: 27, fat_g: 2.6,
    cost_tier: "low", prep_min: 0, diet: ["omnivore", "veg", "vegan", "pesc"], category: "protein",
    unit: "g", allergens: [],
  },
  whey_protein: {
    id: "whey_protein", name: "Whey Protein Powder", kcal: 400, protein_g: 80, carbs_g: 8, fat_g: 5,
    cost_tier: "med", prep_min: 0, diet: ["omnivore", "veg", "pesc"], category: "protein",
    unit: "g", allergens: ["dairy"],
  },
  quinoa: {
    id: "quinoa", name: "Quinoa (cooked)", kcal: 120, protein_g: 4.4, carbs_g: 21, fat_g: 1.9,
    cost_tier: "med", prep_min: 15, diet: ["omnivore", "veg", "vegan", "pesc"], category: "carb",
    unit: "g", allergens: [],
  },
};

/** Compute macros for a given ingredient + grams */
export function computeMacros(ingredientId: string, grams: number): {
  kcal: number; protein_g: number; carbs_g: number; fat_g: number;
} {
  const ing = INGREDIENTS[ingredientId];
  if (!ing) return { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
  const ratio = grams / 100;
  return {
    kcal: Math.round(ing.kcal * ratio * 10) / 10,
    protein_g: Math.round(ing.protein_g * ratio * 10) / 10,
    carbs_g: Math.round(ing.carbs_g * ratio * 10) / 10,
    fat_g: Math.round(ing.fat_g * ratio * 10) / 10,
  };
}
