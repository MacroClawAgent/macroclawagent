import type { DayPlan, ConsolidatedIngredient, IngredientCategory } from '@/types/mealPlan';
import type { PantryItem } from '@/services/pantryService';

// ── Unit normalisation ──────────────────────────────────────────────────────────

const normalizeUnit = (raw: string): string => {
  const u = raw.toLowerCase();
  if (u === 'pieces' || u === 'piece') return 'piece';
  if (u === 'cans' || u === 'can') return 'can';
  if (u === 'cups' || u === 'cup') return 'cup';
  if (u === 'tbsp') return 'tbsp';
  if (u === 'tsp') return 'tsp';
  if (u === 'medium' || u === 'large' || u === 'small') return 'piece';
  return u;
};

// ── Ingredient parser ───────────────────────────────────────────────────────────
// Handles: "Chicken breast (200g)", "Eggs × 3", "Banana (1 medium)", "Olive oil (15ml)"

const parseIngredient = (text: string): { name: string; quantity: number; unit: string } => {
  const parenRegex = /\((\d+(?:\.\d+)?)\s*(g|ml|kg|L|pieces?|medium|large|small|cans?|tbsp|tsp|cups?)\)/i;
  const crossRegex = /[×x]\s*(\d+(?:\.\d+)?)/i;

  const parenMatch = text.match(parenRegex);
  if (parenMatch) {
    const name = text.replace(parenRegex, '').trim().replace(/\s+/g, ' ');
    return { name, quantity: parseFloat(parenMatch[1]), unit: normalizeUnit(parenMatch[2]) };
  }

  const crossMatch = text.match(crossRegex);
  if (crossMatch) {
    const name = text.replace(crossRegex, '').trim().replace(/\s+/g, ' ');
    return { name, quantity: parseFloat(crossMatch[1]), unit: 'piece' };
  }

  return { name: text.trim(), quantity: 1, unit: 'piece' };
};

// ── Name normalisation (for deduplication) ──────────────────────────────────────

const normalizeIngredientName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/s$/, '')   // strip trailing 's' for simple plurals
    .replace(/\s+/g, ' ');
};

const formatIngredientName = (name: string): string => {
  return name
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

const formatQuantity = (qty: number, unit: string): string => {
  if (unit === 'piece') return `${qty} ${qty === 1 ? 'piece' : 'pieces'}`;
  if (unit === 'g' || unit === 'ml' || unit === 'kg' || unit === 'L') return `${qty}${unit}`;
  if (unit === 'tbsp' || unit === 'tsp' || unit === 'cup') return `${qty} ${unit}`;
  return `${qty} ${unit}`;
};

// ── Category classification ─────────────────────────────────────────────────────

const PRODUCE_KEYWORDS = [
  'spinach', 'broccoli', 'capsicum', 'tomato', 'cucumber', 'lettuce', 'onion', 'garlic',
  'ginger', 'avocado', 'lemon', 'lime', 'banana', 'berry', 'sweet potato', 'potato',
  'carrot', 'zucchini', 'mushroom', 'celery', 'kale', 'rocket', 'herbs', 'apple', 'orange',
  'mango', 'blueberry', 'strawberry', 'edamame', 'corn', 'peas', 'broccolini', 'parsley',
  'coriander', 'basil', 'mint', 'dill', 'chilli', 'pepper', 'beetroot', 'asparagus',
];

const PROTEIN_KEYWORDS = [
  'chicken', 'beef', 'lamb', 'pork', 'fish', 'salmon', 'tuna', 'prawn', 'egg', 'tofu',
  'tempeh', 'protein powder', 'whey', 'turkey', 'mince', 'steak', 'fillet', 'shrimp',
  'tilapia', 'cod', 'barramundi', 'lentil', 'chickpea', 'bean', 'edamame',
];

const DAIRY_KEYWORDS = [
  'milk', 'yogurt', 'yoghurt', 'cheese', 'butter', 'cream', 'cottage cheese', 'feta',
  'parmesan', 'almond milk', 'oat milk', 'coconut milk', 'ricotta', 'cheddar', 'mozzarella',
];

const PANTRY_KEYWORDS = [
  'rice', 'oats', 'pasta', 'flour', 'sugar', 'oil', 'sauce', 'soy sauce', 'honey',
  'maple syrup', 'canned', 'tin', 'stock', 'broth', 'vinegar', 'seasoning', 'salt',
  'pepper', 'spice', 'cumin', 'quinoa', 'granola', 'chia', 'flaxseed', 'almond', 'cashew',
  'walnut', 'tahini', 'peanut butter', 'sriracha', 'mustard', 'coconut oil', 'olive oil',
  'canola', 'balsamic', 'fish sauce', 'oyster sauce', 'hoisin', 'miso', 'curry paste',
  'canned tomato', 'passata', 'coconut cream',
];

const BAKERY_KEYWORDS = ['bread', 'wrap', 'tortilla', 'pita', 'sourdough', 'roll', 'bagel'];

const FROZEN_KEYWORDS = ['frozen'];

const categorizeIngredient = (name: string): IngredientCategory => {
  const n = name.toLowerCase();
  if (PRODUCE_KEYWORDS.some(p => n.includes(p))) return 'produce';
  if (PROTEIN_KEYWORDS.some(p => n.includes(p))) return 'protein';
  if (DAIRY_KEYWORDS.some(p => n.includes(p))) return 'dairy';
  if (BAKERY_KEYWORDS.some(p => n.includes(p))) return 'bakery';
  if (FROZEN_KEYWORDS.some(p => n.includes(p))) return 'frozen';
  if (PANTRY_KEYWORDS.some(p => n.includes(p))) return 'pantry';
  return 'other';
};

// ── Price estimates ─────────────────────────────────────────────────────────────

const PRICE_MAP: Record<string, number> = {
  'chicken breast': 11.00,
  'chicken thigh': 9.50,
  'salmon': 14.00,
  'tuna': 2.50,
  'beef mince': 10.00,
  'egg': 6.50,
  'greek yogurt': 5.50,
  'yoghurt': 5.50,
  'cottage cheese': 4.50,
  'milk': 2.80,
  'brown rice': 3.50,
  'jasmine rice': 4.00,
  'white rice': 3.50,
  'oats': 3.00,
  'pasta': 2.50,
  'quinoa': 5.50,
  'broccoli': 3.90,
  'sweet potato': 4.50,
  'spinach': 3.50,
  'banana': 3.90,
  'avocado': 2.50,
  'tomato': 3.50,
  'protein powder': 0,
  'olive oil': 6.00,
  'honey': 5.00,
  'almonds': 7.00,
  'cashew': 8.00,
  'peanut butter': 5.00,
  'bread': 4.50,
  'wrap': 3.50,
};

const getEstimatedPrice = (name: string): number => {
  const n = name.toLowerCase();
  for (const [key, price] of Object.entries(PRICE_MAP)) {
    if (n.includes(key)) return price;
  }
  return 4.50;
};

// ── Supermarket product lookup ──────────────────────────────────────────────────

const PRODUCT_MAP: Record<string, string> = {
  'chicken breast': 'Coles RSPCA Chicken Breast',
  'salmon': 'Coles Atlantic Salmon Portions',
  'egg': 'Coles Free Range Eggs 12pk',
  'greek yogurt': 'Chobani Greek Yogurt 907g',
  'oats': 'Coles Traditional Oats 1kg',
  'brown rice': 'SunRice Brown Rice 1kg',
  'jasmine rice': 'SunRice Jasmine Rice 1kg',
  'white rice': 'SunRice White Rice 1kg',
  'broccoli': 'Broccoli Head (each)',
  'sweet potato': 'Sweet Potato (per kg)',
  'spinach': 'Coles Baby Spinach 120g',
  'banana': 'Cavendish Bananas (per kg)',
  'milk': 'Coles Full Cream Milk 2L',
  'tuna': 'Sirena Tuna Spring Water 95g',
  'olive oil': 'Cobram Estate EVOO 750ml',
  'honey': 'Capilano Pure Honey 500g',
  'cottage cheese': 'Farmers Union Cottage Cheese 500g',
  'pasta': 'Barilla Penne 500g',
  'quinoa': 'Coles Quinoa 500g',
  'avocado': 'Hass Avocado (each)',
};

const getSupermarketProduct = (name: string): string | undefined => {
  const n = name.toLowerCase();
  for (const [key, product] of Object.entries(PRODUCT_MAP)) {
    if (n.includes(key)) return product;
  }
  return undefined;
};

// ── Pantry check ────────────────────────────────────────────────────────────────

const checkIfInPantry = (name: string, pantryItems: PantryItem[]): boolean => {
  const n = normalizeIngredientName(name);
  return pantryItems.some(p => normalizeIngredientName(p.name).includes(n) || n.includes(normalizeIngredientName(p.name)));
};

// ── Main consolidation function ─────────────────────────────────────────────────

const CATEGORY_ORDER: IngredientCategory[] = [
  'produce', 'protein', 'dairy', 'pantry', 'bakery', 'frozen', 'other',
];

export const consolidateIngredients = (
  days: DayPlan[],
  pantryItems: PantryItem[],
): ConsolidatedIngredient[] => {
  const merged = new Map<string, ConsolidatedIngredient>();

  for (const day of days) {
    for (const [mealType, meal] of Object.entries(day.meals)) {
      if (!meal) continue;
      for (const ingredientText of meal.ingredientsList) {
        const parsed = parseIngredient(ingredientText);
        const key = normalizeIngredientName(parsed.name);
        const mealRef = `${day.dayLabel} ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`;

        if (merged.has(key)) {
          const existing = merged.get(key)!;
          if (existing.unit === parsed.unit) {
            existing.totalQuantity += parsed.quantity;
            existing.displayQuantity = formatQuantity(existing.totalQuantity, existing.unit);
          }
          if (!existing.usedIn.includes(mealRef)) {
            existing.usedIn.push(mealRef);
          }
        } else {
          const formattedName = formatIngredientName(parsed.name);
          merged.set(key, {
            id: `ci-${key}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: formattedName,
            totalQuantity: parsed.quantity,
            unit: parsed.unit,
            displayQuantity: formatQuantity(parsed.quantity, parsed.unit),
            category: categorizeIngredient(parsed.name),
            usedIn: [mealRef],
            isInPantry: checkIfInPantry(parsed.name, pantryItems),
            estimatedPrice: getEstimatedPrice(parsed.name),
            supermarketProduct: getSupermarketProduct(parsed.name),
            store: 'coles',
            isChecked: false,
          });
        }
      }
    }
  }

  return Array.from(merged.values()).sort(
    (a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category),
  );
};
