import type { IngredientCategory, SmartCartIngredient } from '../types/smartCart';

// ── Category assignment ───────────────────────────────────────────────────────

const CATEGORY_KEYWORDS: Record<IngredientCategory, string[]> = {
  protein:    ['chicken', 'beef', 'pork', 'lamb', 'fish', 'salmon', 'tuna', 'turkey', 'egg', 'eggs', 'protein', 'tofu', 'tempeh', 'shrimp', 'prawn', 'steak', 'mince', 'mincemeat'],
  carbs:      ['rice', 'pasta', 'bread', 'oat', 'oats', 'potato', 'sweet potato', 'noodle', 'noodles', 'quinoa', 'barley', 'cereal', 'wrap', 'tortilla', 'flour', 'couscous'],
  vegetables: ['spinach', 'broccoli', 'kale', 'cucumber', 'tomato', 'lettuce', 'capsicum', 'pepper', 'carrot', 'zucchini', 'celery', 'onion', 'garlic', 'asparagus', 'mushroom', 'bean', 'pea', 'corn', 'cabbage', 'bok choy', 'salad', 'vegetable', 'veggie'],
  dairy:      ['milk', 'yogurt', 'yoghurt', 'cheese', 'cream', 'butter', 'cottage cheese', 'greek yogurt', 'kefir', 'whey'],
  fats:       ['oil', 'olive oil', 'avocado', 'almond', 'almonds', 'walnut', 'walnuts', 'cashew', 'nut', 'nuts', 'peanut', 'peanut butter', 'coconut', 'seed', 'seeds', 'flaxseed', 'chia'],
  condiments: ['salt', 'pepper', 'sauce', 'soy sauce', 'hot sauce', 'vinegar', 'mustard', 'ketchup', 'mayonnaise', 'honey', 'maple', 'spice', 'herb', 'lemon', 'lime', 'stock', 'broth', 'seasoning', 'dressing'],
  other:      [],
};

export function assignCategory(name: string): IngredientCategory {
  const lower = name.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [IngredientCategory, string[]][]) {
    if (category === 'other') continue;
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }
  return 'other';
}

function makeId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ── From optimizer grocery_list ───────────────────────────────────────────────

interface GroceryListItem {
  name: string;
  grams?: number;
  quantity?: number;
  unit?: string;
}

export function generateCartFromGroceryList(
  groceryList: GroceryListItem[]
): SmartCartIngredient[] {
  // Deduplicate by lowercased name, summing grams
  const map = new Map<string, { name: string; grams: number; unit: string }>();
  for (const item of groceryList) {
    const key = item.name.trim().toLowerCase();
    const grams = item.grams ?? item.quantity ?? 100;
    const existing = map.get(key);
    if (existing) {
      existing.grams += grams;
    } else {
      map.set(key, { name: item.name.trim(), grams, unit: item.unit ?? 'g' });
    }
  }

  return Array.from(map.values()).map((item) => ({
    id: makeId(),
    name: item.name,
    quantity: item.grams,
    unit: item.unit,
    category: assignCategory(item.name),
    isChecked: true,
    woolworthsProducts: [],
    colesProducts: [],
    selectedProductId: null,
    isLoadingProducts: true,
  }));
}

// ── From macro targets (default when no plan) ─────────────────────────────────

function makeIngredient(
  name: string,
  quantity: number,
  unit: string
): SmartCartIngredient {
  return {
    id: makeId(),
    name,
    quantity,
    unit,
    category: assignCategory(name),
    isChecked: true,
    woolworthsProducts: [],
    colesProducts: [],
    selectedProductId: null,
    isLoadingProducts: true,
  };
}

export function generateDefaultCartFromMacros(
  proteinGoal: number,
  carbsGoal: number,
  fatGoal: number
): SmartCartIngredient[] {
  const totalCals = proteinGoal * 4 + carbsGoal * 4 + fatGoal * 9;
  const proteinPct = totalCals > 0 ? (proteinGoal * 4) / totalCals : 0.3;
  const carbsPct   = totalCals > 0 ? (carbsGoal * 4)   / totalCals : 0.4;

  const items: SmartCartIngredient[] = [];

  // High protein (>30% of cals)
  if (proteinPct >= 0.3) {
    items.push(
      makeIngredient('Chicken Breast', 700, 'g'),
      makeIngredient('Eggs', 12, 'pcs'),
      makeIngredient('Greek Yogurt', 500, 'g'),
      makeIngredient('Tuna in Spring Water', 4, 'cans'),
    );
  } else {
    items.push(
      makeIngredient('Chicken Breast', 500, 'g'),
      makeIngredient('Eggs', 6, 'pcs'),
    );
  }

  // High carbs (>45% of cals)
  if (carbsPct >= 0.45) {
    items.push(
      makeIngredient('White Rice', 1000, 'g'),
      makeIngredient('Rolled Oats', 500, 'g'),
      makeIngredient('Sweet Potato', 4, 'pcs'),
      makeIngredient('Banana', 6, 'pcs'),
    );
  } else {
    items.push(
      makeIngredient('White Rice', 500, 'g'),
      makeIngredient('Rolled Oats', 500, 'g'),
    );
  }

  // Always include essentials
  items.push(
    makeIngredient('Broccoli', 500, 'g'),
    makeIngredient('Baby Spinach', 200, 'g'),
    makeIngredient('Mixed Vegetables', 400, 'g'),
    makeIngredient('Olive Oil', 500, 'ml'),
  );

  return items;
}
