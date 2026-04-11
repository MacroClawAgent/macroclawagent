import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserPreferences } from '@/types/preferences';
import { DEFAULT_PREFERENCES } from '@/types/preferences';
import { apiPost } from '@/lib/api';

const STORAGE_KEY = 'jonno_preferences';

export const savePreferences = async (prefs: UserPreferences): Promise<void> => {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...prefs, lastUpdated: new Date().toISOString() }),
  );
  // Sync to Supabase in background (non-blocking)
  apiPost('/api/profile/update', {
    dietary_requirement: prefs.dietaryRequirement,
    allergies: prefs.allergies,
    cuisines: prefs.cuisines,
    budget: prefs.budget,
    cooking_time: prefs.cookingTime,
    servings: prefs.servings,
    spice_level: prefs.spiceLevel,
    disliked_ingredients: prefs.dislikedIngredients,
  }).catch(() => {}); // Silent — local is source of truth
};

export const loadPreferences = async (): Promise<UserPreferences> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    return DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

export const buildConstraintString = (prefs: UserPreferences): string => {
  const hard: string[] = [];
  const soft: string[] = [];

  // ── HARD CONSTRAINTS ───────────────────────────────────────────────────────

  if (prefs.dietaryRequirement === 'halal') {
    hard.push(
      'HALAL ONLY — This is non-negotiable:\n' +
      '• NO pork, bacon, ham, prosciutto, lard or any pork product\n' +
      '• NO alcohol in any ingredient, marinade or cooking method\n' +
      '• NO blood products\n' +
      '• ALL meat must be halal-certified\n' +
      '• Gelatine must be halal-certified or plant-based\n' +
      '• Check sauces — no worcestershire sauce, use halal alternatives',
    );
  }
  if (prefs.dietaryRequirement === 'vegetarian') {
    hard.push(
      'VEGETARIAN ONLY — This is non-negotiable:\n' +
      '• NO meat of any kind\n' +
      '• NO fish or seafood\n' +
      '• NO poultry\n' +
      '• Eggs and dairy ARE allowed',
    );
  }
  if (prefs.dietaryRequirement === 'vegan') {
    hard.push(
      'VEGAN ONLY — This is non-negotiable:\n' +
      '• NO animal products of any kind\n' +
      '• NO meat, fish, poultry, eggs, dairy, honey\n' +
      '• NO gelatine or animal-derived additives\n' +
      '• Use plant-based protein: tofu, tempeh, legumes, lentils, chickpeas',
    );
  }
  if (prefs.dietaryRequirement === 'pescatarian') {
    hard.push(
      'PESCATARIAN:\n' +
      '• NO meat or poultry\n' +
      '• Fish and seafood ARE allowed\n' +
      '• Eggs and dairy ARE allowed',
    );
  }
  if (prefs.dietaryRequirement === 'kosher') {
    hard.push(
      'KOSHER — This is non-negotiable:\n' +
      '• NO pork or shellfish\n' +
      '• Do NOT combine meat and dairy in the same meal\n' +
      '• Meat must be properly prepared (no blood)\n' +
      '• Separate meat meals and dairy meals',
    );
  }
  if (prefs.allergies.includes('gluten')) {
    hard.push(
      'GLUTEN ALLERGY — Strictly gluten-free:\n' +
      '• NO wheat, barley, rye, regular oats\n' +
      '• Use rice, quinoa, gluten-free oats, corn, potato\n' +
      '• Check sauces — use tamari instead of soy sauce',
    );
  }
  if (prefs.allergies.includes('dairy')) {
    hard.push(
      'DAIRY ALLERGY — Strictly dairy-free:\n' +
      '• NO milk, cheese, butter, cream, yogurt, whey\n' +
      '• Use coconut milk, almond milk, olive oil instead',
    );
  }
  if (prefs.allergies.includes('nuts')) {
    hard.push(
      'NUT ALLERGY — No nuts of any kind:\n' +
      '• NO peanuts, almonds, cashews, walnuts, pistachios\n' +
      '• NO nut butters or nut oils',
    );
  }
  if (prefs.allergies.includes('eggs'))  hard.push('EGG ALLERGY: NO eggs in any form.');
  if (prefs.allergies.includes('soy'))   hard.push('SOY ALLERGY: NO soy sauce, tofu, edamame, miso. Use coconut aminos instead.');
  if (prefs.allergies.includes('shellfish')) hard.push('SHELLFISH ALLERGY: NO prawns, crab, lobster, mussels, oysters, scallops.');
  if (prefs.allergies.includes('sesame')) hard.push('SESAME ALLERGY: NO sesame oil, tahini, sesame seeds.');

  // ── SOFT PREFERENCES ───────────────────────────────────────────────────────

  if (prefs.cuisines.length > 0) {
    soft.push(
      `PREFERRED CUISINES: ${prefs.cuisines.join(', ')}\n` +
      'Rotate through these cuisines. Do not repeat the same cuisine for consecutive meals.',
    );
  }
  if (prefs.budget === 'budget') {
    soft.push(
      'BUDGET — AFFORDABLE (under $80 AUD/week):\n' +
      '• Chicken thighs, eggs, canned tuna, chickpeas, lentils\n' +
      '• Frozen vegetables are fine. Rice, oats, pasta as carb bases.\n' +
      '• Avoid salmon, beef tenderloin, exotic produce.\n' +
      '• All ingredients available at Woolworths or Coles.',
    );
  } else if (prefs.budget === 'flexible') {
    soft.push('BUDGET — FLEXIBLE ($150+ AUD/week): Use premium ingredients freely. Salmon, beef fillet, fresh herbs all fine.');
  }
  if (prefs.cookingTime === 'quick') {
    soft.push(
      'COOKING TIME — QUICK (under 20 min):\n' +
      '• One-pan meals, minimal chopping, pre-cooked grains fine.\n' +
      '• No marinating overnight, no oven recipes over 20 min.',
    );
  } else if (prefs.cookingTime === 'elaborate') {
    soft.push('COOKING TIME — ENJOYS COOKING (up to 60+ min): Complex multi-step recipes welcome.');
  }
  if (prefs.dislikedIngredients.length > 0) {
    soft.push(`INGREDIENTS TO AVOID: ${prefs.dislikedIngredients.join(', ')}. Replace with suitable alternatives.`);
  }
  if (prefs.spiceLevel === 'mild')  soft.push('SPICE LEVEL — MILD: No chilli, minimal black pepper.');
  if (prefs.spiceLevel === 'spicy') soft.push('SPICE LEVEL — SPICY: Include chilli, sriracha, bold spices where appropriate.');
  if (prefs.servings > 1)           soft.push(`SERVINGS: All portions for ${prefs.servings} people. Scale all ingredient quantities accordingly.`);

  const hardSection = hard.length > 0
    ? `HARD CONSTRAINTS — NEVER VIOLATE THESE:\n${hard.map((c, i) => `${i + 1}. ${c}`).join('\n\n')}`
    : '';
  const softSection = soft.length > 0
    ? `PREFERENCES — RESPECT THESE:\n${soft.map((p, i) => `${i + 1}. ${p}`).join('\n\n')}`
    : '';

  return [hardSection, softSection].filter(Boolean).join('\n\n─────────────────────────────\n\n');
};

export const getPreferencesSummary = (prefs: UserPreferences): string[] => {
  const tags: string[] = [];
  const dietLabels: Record<string, string> = {
    halal: '🕌 Halal', kosher: '✡️ Kosher', vegetarian: '🥗 Vegetarian',
    vegan: '🌱 Vegan', pescatarian: '🐟 Pescatarian',
  };
  if (prefs.dietaryRequirement !== 'none') tags.push(dietLabels[prefs.dietaryRequirement]);
  prefs.allergies.forEach(a => tags.push(`No ${a}`));
  if (prefs.cuisines.length > 0) tags.push(prefs.cuisines.slice(0, 2).join(' & '));
  if (prefs.budget === 'budget')   tags.push('💰 Budget');
  if (prefs.budget === 'flexible') tags.push('💎 Premium');
  if (prefs.cookingTime === 'quick') tags.push('⚡ Quick meals');
  if (prefs.servings > 1) tags.push(`👥 ${prefs.servings} servings`);
  return tags;
};
