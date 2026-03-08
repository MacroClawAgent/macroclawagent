/**
 * LLM Tool Definitions
 * Internal tool functions available to Claude during substitution requests.
 * The LLM must call these before confirming any substitution.
 */

import { computeMacros, INGREDIENTS } from "../optimizer/ingredients";
import { MacroTotals } from "../types/optimizer";

// ── Tool Schemas (for Anthropic tools API) ────────────────────

export const TOOL_DEFINITIONS = [
  {
    name: "macro_check",
    description:
      "Check if a meal or substitution stays within macro tolerance vs the daily target. " +
      "Call this before confirming any ingredient substitution.",
    input_schema: {
      type: "object" as const,
      properties: {
        meal_name: { type: "string", description: "Name of the meal being checked" },
        ingredients: {
          type: "array",
          description: "List of ingredients with id and grams",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              grams: { type: "number" },
            },
            required: ["id", "grams"],
          },
        },
        target_calories: { type: "number", description: "Target calories for this meal" },
        target_protein_g: { type: "number", description: "Target protein in grams" },
      },
      required: ["meal_name", "ingredients", "target_calories", "target_protein_g"],
    },
  },
  {
    name: "allergy_check",
    description:
      "Check if a list of ingredients is safe for a user's allergies. " +
      "Call this before confirming any substitution.",
    input_schema: {
      type: "object" as const,
      properties: {
        ingredients: {
          type: "array",
          items: { type: "string" },
          description: "List of ingredient IDs or names to check",
        },
        allergies: {
          type: "array",
          items: { type: "string" },
          description: "User's known allergies (e.g. ['dairy', 'nuts'])",
        },
      },
      required: ["ingredients", "allergies"],
    },
  },
  {
    name: "cost_estimate",
    description: "Estimate the budget score for a grocery list against a budget level.",
    input_schema: {
      type: "object" as const,
      properties: {
        ingredient_ids: {
          type: "array",
          items: { type: "string" },
          description: "List of ingredient IDs in the plan",
        },
        budget_level: {
          type: "string",
          enum: ["low", "med", "high"],
          description: "User's budget level",
        },
      },
      required: ["ingredient_ids", "budget_level"],
    },
  },
];

// ── Tool Implementations ──────────────────────────────────────

export interface MacroCheckInput {
  meal_name: string;
  ingredients: { id: string; grams: number }[];
  target_calories: number;
  target_protein_g: number;
}

export function macroCheck(input: MacroCheckInput): {
  delta_kcal: number;
  delta_protein_g: number;
  within_tolerance: boolean;
  details: MacroTotals;
} {
  let calories = 0, protein_g = 0, carbs_g = 0, fat_g = 0;
  for (const { id, grams } of input.ingredients) {
    const m = computeMacros(id, grams);
    calories += m.kcal;
    protein_g += m.protein_g;
    carbs_g += m.carbs_g;
    fat_g += m.fat_g;
  }

  const delta_kcal = Math.round(calories - input.target_calories);
  const delta_protein_g = Math.round((protein_g - input.target_protein_g) * 10) / 10;
  const within_tolerance =
    Math.abs(delta_kcal / input.target_calories) <= 0.15 &&
    delta_protein_g >= -input.target_protein_g * 0.05;

  return {
    delta_kcal,
    delta_protein_g,
    within_tolerance,
    details: { calories: Math.round(calories), protein_g: Math.round(protein_g * 10) / 10, carbs_g: Math.round(carbs_g * 10) / 10, fat_g: Math.round(fat_g * 10) / 10 },
  };
}

export interface AllergyCheckInput {
  ingredients: string[];
  allergies: string[];
}

export function allergyCheck(input: AllergyCheckInput): {
  safe: boolean;
  flagged: string[];
} {
  const userAllergies = input.allergies.map((a) => a.toLowerCase());
  const flagged: string[] = [];

  for (const ingredientId of input.ingredients) {
    const ing = INGREDIENTS[ingredientId];
    if (ing) {
      for (const allergen of ing.allergens) {
        if (userAllergies.includes(allergen.toLowerCase())) {
          flagged.push(`${ing.name} contains ${allergen}`);
        }
      }
    }
  }

  return { safe: flagged.length === 0, flagged };
}

export interface CostEstimateInput {
  ingredient_ids: string[];
  budget_level: "low" | "med" | "high";
}

export function costEstimate(input: CostEstimateInput): {
  score: number;  // 0 (cheapest) – 10 (most expensive)
  over_budget: boolean;
} {
  const tierScore: Record<string, number> = { low: 1, med: 5, high: 9 };
  const scores = input.ingredient_ids.map((id) => {
    const ing = INGREDIENTS[id];
    return ing ? tierScore[ing.cost_tier] ?? 5 : 5;
  });
  const avgScore = scores.length > 0
    ? scores.reduce((a, b) => a + b, 0) / scores.length
    : 5;
  const budgetThreshold = { low: 3, med: 6, high: 10 };
  return {
    score: Math.round(avgScore * 10) / 10,
    over_budget: avgScore > budgetThreshold[input.budget_level],
  };
}

/** Dispatch a tool call by name */
export function dispatchTool(name: string, input: Record<string, unknown>): unknown {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (name === "macro_check") return macroCheck(input as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (name === "allergy_check") return allergyCheck(input as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (name === "cost_estimate") return costEstimate(input as any);
  throw new Error(`Unknown tool: ${name}`);
}
