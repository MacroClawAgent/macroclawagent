import type { UserPreferences } from '@/types/preferences';
import type { Meal, DayPlan, MealType } from '@/types/mealPlan';
import { buildConstraintString } from './preferencesService';
import { getPantryString } from './pantryService';
import type { PantryItem } from './pantryService';
import { apiPost } from '@/lib/api';

interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  goal: string;
  consumed?: { calories: number; protein: number; carbs: number; fat: number };
  activityContext?: {
    workoutLabel?: string;
    caloriesBurned?: number;
    steps?: number;
  };
}

function buildActivityLine(activityContext?: NutritionTargets['activityContext']): string {
  if (!activityContext) return '';
  if (activityContext.workoutLabel && activityContext.caloriesBurned) {
    return `\nTRAINING TODAY: ${activityContext.workoutLabel} · ${activityContext.caloriesBurned} kcal burned. Adjust meals: increase complex carbs for glycogen replenishment and ensure protein targets are met for muscle recovery.\n`;
  }
  if (activityContext.steps && activityContext.steps > 3000) {
    return `\nACTIVITY TODAY: ${activityContext.steps.toLocaleString()} steps · ${activityContext.caloriesBurned ?? 0} kcal active energy. Account for extra calorie burn when planning meals.\n`;
  }
  return '';
}

// ── Prompt builders ────────────────────────────────────────────────────────────

const MEAL_JSON_SPEC = `{"type":"breakfast","name":"meal name (max 5 words)","ingredients":"Ingredient 1 (150g), Ingredient 2 (100g)","ingredientsList":["ingredient 1","ingredient 2"],"calories":520,"protein":42,"carbs":48,"fat":14,"time":"7:30 AM","emoji":"🍗","cookTime":20,"difficulty":"Easy","reason":"One sentence max 15 words explaining why this meal is right for this user right now. Be specific — reference their goal, remaining macros, or pantry items.","recipeSteps":["Step 1.","Step 2.","Step 3.","Step 4.","Step 5."]}`;

function buildTodayPrompt(prefs: UserPreferences, targets: NutritionTargets, pantryItems?: PantryItem[]): string {
  const constraints = buildConstraintString(prefs);
  const pantryContext = pantryItems && pantryItems.length > 0 ? `\n${getPantryString(pantryItems)}\n` : '';
  const consumedCtx = targets.consumed
    ? `\nALREADY EATEN TODAY: ${targets.consumed.calories} kcal, ${targets.consumed.protein}g protein, ${targets.consumed.carbs}g carbs, ${targets.consumed.fat}g fat.\nRemaining: ${targets.calories - targets.consumed.calories} kcal, ${targets.protein - targets.consumed.protein}g protein.\n`
    : '';
  const activityLine = buildActivityLine(targets.activityContext);
  return (
    `You are a professional nutritionist creating a personalised meal plan for an Australian user.\n\n` +
    (constraints ? `USER CONSTRAINTS:\n${constraints}\n\n` : '') +
    `USER NUTRITION TARGETS:\nGoal: ${targets.goal}\nDaily calories: ${targets.calories} kcal\n` +
    `Protein: ${targets.protein}g\nCarbs: ${targets.carbs}g\nFat: ${targets.fat}g\n` +
    `Servings: ${prefs.servings} person(s)\n` +
    consumedCtx + activityLine + pantryContext + `\n` +
    `Generate exactly 4 meals for today: breakfast, lunch, snack, dinner.\n\n` +
    `For EACH meal return this exact JSON structure:\n${MEAL_JSON_SPEC}\n\n` +
    `Return a JSON array of exactly 4 meal objects.\n` +
    `Use realistic Australian supermarket ingredients. Include quantities in grams.\n` +
    `Recipe steps: 5-6 steps, each max 2 sentences. JSON only — no other text.`
  );
}

function buildSingleMealPrompt(mealType: MealType, prefs: UserPreferences, targets: NutritionTargets, pantryItems?: PantryItem[]): string {
  const constraints = buildConstraintString(prefs);
  const pantryContext = pantryItems && pantryItems.length > 0 ? `\n${getPantryString(pantryItems)}\n` : '';
  const consumedCtx = targets.consumed
    ? `\nALREADY EATEN TODAY: ${targets.consumed.calories} kcal, ${targets.consumed.protein}g protein.\nRemaining today: ${targets.calories - targets.consumed.calories} kcal, ${targets.protein - targets.consumed.protein}g protein.\n`
    : '';
  const calTarget = mealType === 'breakfast' ? Math.round(targets.calories * 0.25)
    : mealType === 'lunch' ? Math.round(targets.calories * 0.30)
    : mealType === 'dinner' ? Math.round(targets.calories * 0.30)
    : Math.round(targets.calories * 0.15);
  const activityLine = buildActivityLine(targets.activityContext);
  return (
    `You are a professional nutritionist. Suggest ONE ${mealType} meal for an Australian user.\n\n` +
    (constraints ? `USER CONSTRAINTS:\n${constraints}\n\n` : '') +
    `USER GOAL: ${targets.goal}\nTarget for this meal: ~${calTarget} kcal, ${Math.round(targets.protein * (calTarget / targets.calories))}g protein\n` +
    consumedCtx + activityLine + pantryContext + `\n` +
    `Return a single JSON object (not an array) with this structure:\n${MEAL_JSON_SPEC}\n\n` +
    `JSON only — no other text.`
  );
}

function buildWeekPrompt(prefs: UserPreferences, targets: NutritionTargets): string {
  const constraints = buildConstraintString(prefs);
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  const activityLine = buildActivityLine(targets.activityContext);
  return (
    `You are a professional nutritionist creating a personalised 7-day meal plan for an Australian user.\n\n` +
    (constraints ? `USER CONSTRAINTS:\n${constraints}\n\n` : '') +
    `USER NUTRITION TARGETS:\nGoal: ${targets.goal}\nDaily calories: ${targets.calories} kcal\n` +
    `Protein: ${targets.protein}g\nCarbs: ${targets.carbs}g\nFat: ${targets.fat}g\n` +
    `Servings: ${prefs.servings} person(s)\n` + activityLine + `\n` +
    `Generate 7 days of meals (Monday to Sunday). Each day has 4 meals: breakfast, lunch, snack, dinner.\n\n` +
    `VARIETY RULES:\n- Never repeat the same meal twice in the week\n` +
    `- Rotate protein sources: chicken, fish, beef/lamb, eggs, legumes throughout the week\n` +
    `- Vary cuisines and cooking methods\n\n` +
    `Return this exact JSON structure:\n` +
    `{"days":[{"dayLabel":"Monday","date":"${monday.toISOString().split('T')[0]}","meals":{"breakfast":{...meal},"lunch":{...meal},"snack":{...meal},"dinner":{...meal}}}]}\n\n` +
    `Each meal object: type, name, ingredients, ingredientsList, calories, protein, carbs, fat, time, emoji, cookTime, difficulty, recipeSteps.\n` +
    `JSON only — no other text.`
  );
}

// ── Helper: build DayPlan from raw meal array ──────────────────────────────────

function buildDayPlan(dayLabel: string, date: string, meals: any[]): DayPlan {
  const mealMap: Record<string, Meal> = {};
  meals.forEach(m => {
    mealMap[m.type] = {
      ...m,
      id: `${m.type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      isLogged: false,
      status: 'upcoming' as const,
    };
  });
  const totals = meals.reduce(
    (acc, m) => ({
      totalCalories: acc.totalCalories + (m.calories ?? 0),
      totalProtein:  acc.totalProtein  + (m.protein  ?? 0),
      totalCarbs:    acc.totalCarbs    + (m.carbs    ?? 0),
      totalFat:      acc.totalFat      + (m.fat      ?? 0),
    }),
    { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 },
  );
  const allIngredients = [...new Set(meals.flatMap(m => m.ingredientsList ?? []))];
  return {
    date,
    dayLabel,
    meals: mealMap as DayPlan['meals'],
    allIngredients,
    ...totals,
  };
}

// ── Parse server response (routes through /api/agent/chat) ────────────────────

async function callAgent(prompt: string): Promise<string> {
  const result = await apiPost<{ response?: string; reply?: string; content?: string }>('/api/agent/chat', { message: prompt });
  return result.response ?? result.reply ?? (result as any).content ?? '';
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function generateSingleMeal(
  mealType: MealType,
  preferences: UserPreferences,
  targets: NutritionTargets,
  pantryItems?: PantryItem[],
): Promise<Meal> {
  try {
    const prompt = buildSingleMealPrompt(mealType, preferences, targets, pantryItems);
    const responseText = await callAgent(prompt);
    const clean = responseText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return { ...parsed, id: `${mealType}-${Date.now()}`, isLogged: false, status: 'upcoming' as const };
  } catch {
    const mockPlan = getMockMealPlan('today', preferences);
    return mockPlan[0].meals[mealType];
  }
}

export async function generateMealPlan(
  type: 'today' | 'week',
  preferences: UserPreferences,
  targets: NutritionTargets,
  pantryItems?: PantryItem[],
): Promise<DayPlan[]> {
  try {
    const prompt = type === 'today'
      ? buildTodayPrompt(preferences, targets, pantryItems)
      : buildWeekPrompt(preferences, targets);

    const responseText = await callAgent(prompt);
    const clean = responseText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    if (type === 'today') {
      const meals = Array.isArray(parsed) ? parsed : parsed.meals ?? [];
      return [buildDayPlan('Today', new Date().toISOString(), meals)];
    } else {
      return parsed.days.map((day: any) =>
        buildDayPlan(day.dayLabel, day.date, Object.values(day.meals)),
      );
    }
  } catch (error) {
    console.warn('Meal generation fell back to mock:', error);
    return getMockMealPlan(type, preferences);
  }
}

export async function generateRecipe(meal: Meal): Promise<string[]> {
  if (meal.recipeSteps && meal.recipeSteps.length > 0) return meal.recipeSteps;
  try {
    const responseText = await callAgent(
      `Give me step-by-step cooking instructions for ${meal.name} using: ${meal.ingredients}. ` +
      `Return JSON: {"steps":["step1","step2"...]} — 5-6 steps, each max 2 sentences. JSON only.`,
    );
    const parsed = JSON.parse(responseText.replace(/```json|```/g, '').trim());
    return parsed.steps ?? [];
  } catch {
    return [
      `Prepare all ingredients: ${meal.ingredients}.`,
      'Heat a pan over medium-high heat with a drizzle of olive oil.',
      'Cook the protein first until golden and cooked through.',
      'Add vegetables and cook for 3-4 minutes until tender.',
      'Season with salt and pepper, combine all ingredients.',
      'Plate and serve immediately. Enjoy!',
    ];
  }
}

// ── Mock data fallback ─────────────────────────────────────────────────────────

function getMockMealPlan(type: 'today' | 'week', prefs: UserPreferences): DayPlan[] {
  const isVeg   = ['vegetarian', 'vegan'].includes(prefs.dietaryRequirement);
  const isVegan = prefs.dietaryRequirement === 'vegan';
  const isHalal = prefs.dietaryRequirement === 'halal';
  const noNuts  = prefs.allergies.includes('nuts');
  const noDairy = prefs.allergies.includes('dairy');

  const mockBreakfast: Meal = {
    id: 'b1', type: 'breakfast',
    reason: 'High-protein start sets your metabolism up for the day ahead.',
    name: isVeg ? 'Overnight Oats & Berries' : 'Greek Yogurt Parfait',
    ingredients: isVeg || noDairy
      ? 'Rolled oats (80g), almond milk (200ml), mixed berries (100g), chia seeds (15g), maple syrup (10ml)'
      : 'Greek yogurt (200g), granola (50g), banana (1 medium), honey (15ml)',
    ingredientsList: isVeg || noDairy
      ? ['rolled oats', 'almond milk', 'mixed berries', 'chia seeds', 'maple syrup']
      : ['Greek yogurt', 'granola', 'banana', 'honey'],
    calories: 420, protein: 22, carbs: 58, fat: 10,
    time: '7:30 AM', emoji: '🥣', cookTime: 5, difficulty: 'Easy',
    isLogged: false, status: 'upcoming',
    recipeSteps: [
      'Combine oats and milk in a bowl or jar.',
      'Stir in chia seeds and a drizzle of maple syrup.',
      'Refrigerate overnight or for at least 1 hour.',
      'Top with fresh mixed berries before serving.',
      'Optional: add a sprinkle of granola for crunch.',
    ],
  };

  const mockLunch: Meal = {
    id: 'l1', type: 'lunch',
    reason: 'Hits your highest protein target for the day in one meal.',
    name: isVeg ? 'Chickpea Buddha Bowl' : 'Chicken & Rice Bowl',
    ingredients: isVeg
      ? 'Chickpeas (200g), brown rice (150g), cucumber (100g), cherry tomatoes (100g), tahini (30g), lemon juice (15ml)'
      : 'Chicken breast (200g), jasmine rice (150g), broccoli (150g), soy sauce (15ml), garlic (2 cloves), olive oil (15ml)',
    ingredientsList: isVeg
      ? ['chickpeas', 'brown rice', 'cucumber', 'cherry tomatoes', noNuts ? 'lemon' : 'tahini', 'lemon']
      : ['chicken breast', 'jasmine rice', 'broccoli', 'soy sauce', 'garlic', 'olive oil'],
    calories: 580, protein: isVeg ? 24 : 42, carbs: 65, fat: 12,
    time: '12:30 PM', emoji: isVeg ? '🥗' : '🍗', cookTime: 20, difficulty: 'Easy',
    isLogged: false, status: 'upcoming',
    recipeSteps: isVeg ? [
      'Cook brown rice according to packet (15–20 min).',
      'Drain and rinse chickpeas. Pan-fry with olive oil until golden.',
      'Mix tahini with lemon juice and a splash of water to make dressing.',
      'Slice cucumber and halve cherry tomatoes.',
      'Assemble bowl with rice as base, top with chickpeas and vegetables.',
      'Drizzle tahini dressing over and serve.',
    ] : [
      'Cook jasmine rice according to packet instructions.',
      'Season chicken with salt, pepper and minced garlic.',
      'Pan-fry chicken in olive oil 6–7 min each side until cooked through.',
      'Steam broccoli for 3–4 minutes until bright green.',
      'Slice chicken and assemble bowl with rice as the base.',
      'Drizzle with soy sauce and serve immediately.',
    ],
  };

  const mockSnack: Meal = {
    id: 's1', type: 'snack',
    reason: 'Keeps protein consistent between meals without spiking calories.',
    name: isVegan ? 'Plant Protein Shake' : 'Protein Shake & Apple',
    ingredients: isVegan || noDairy
      ? 'Plant protein powder (30g), oat milk (250ml), apple (1 medium)'
      : 'Whey protein (30g), low-fat milk (250ml), apple (1 medium)',
    ingredientsList: ['protein powder', isVegan || noDairy ? 'oat milk' : 'milk', 'apple'],
    calories: 280, protein: 28, carbs: 32, fat: 4,
    time: '3:30 PM', emoji: '🥛', cookTime: 2, difficulty: 'Easy',
    isLogged: false, status: 'upcoming',
    recipeSteps: [
      'Add milk to a shaker or blender.',
      'Add protein powder and shake/blend until smooth.',
      'Serve immediately with a fresh apple on the side.',
    ],
  };

  const mockDinner: Meal = {
    id: 'd1', type: 'dinner',
    reason: 'Closes your protein gap for the day with anti-inflammatory omega-3.',
    name: isVeg ? 'Lentil & Vegetable Curry' : 'Salmon & Sweet Potato',
    ingredients: isVeg
      ? 'Red lentils (180g), coconut milk (200ml), sweet potato (200g), spinach (100g), curry paste (30g), onion (1 medium)'
      : 'Atlantic salmon fillet (200g), sweet potato (200g), broccolini (150g), olive oil (15ml), lemon (½), garlic (2 cloves)',
    ingredientsList: isVeg
      ? ['red lentils', 'coconut milk', 'sweet potato', 'spinach', 'curry paste', 'onion']
      : ['salmon fillet', 'sweet potato', 'broccolini', 'olive oil', 'lemon', 'garlic'],
    calories: 620, protein: isVeg ? 28 : 44, carbs: 65, fat: 18,
    time: '7:00 PM', emoji: isVeg ? '🍛' : '🐟', cookTime: 30, difficulty: 'Easy',
    isLogged: false, status: 'upcoming',
    recipeSteps: isVeg ? [
      'Dice sweet potato and onion. Sauté onion in oil until soft.',
      'Add curry paste and cook for 1 minute until fragrant.',
      'Add lentils, sweet potato and coconut milk. Stir to combine.',
      'Simmer on medium heat for 20–25 minutes until lentils are soft.',
      'Stir in spinach until wilted. Season with salt.',
      'Serve with rice or naan bread.',
    ] : [
      'Preheat oven to 200°C. Cube sweet potato and toss with olive oil.',
      'Roast sweet potato for 25 minutes until golden.',
      'Season salmon with salt, pepper, garlic and lemon zest.',
      'Pan-fry salmon skin-side down for 4 min, flip for 2 min.',
      'Steam broccolini for 3–4 minutes.',
      'Plate salmon on sweet potato with broccolini. Squeeze lemon over.',
    ],
  };

  const base: DayPlan = {
    date: new Date().toISOString(),
    dayLabel: 'Today',
    meals: { breakfast: mockBreakfast, lunch: mockLunch, snack: mockSnack, dinner: mockDinner },
    totalCalories: mockBreakfast.calories + mockLunch.calories + mockSnack.calories + mockDinner.calories,
    totalProtein:  mockBreakfast.protein  + mockLunch.protein  + mockSnack.protein  + mockDinner.protein,
    totalCarbs:    mockBreakfast.carbs    + mockLunch.carbs    + mockSnack.carbs    + mockDinner.carbs,
    totalFat:      mockBreakfast.fat      + mockLunch.fat      + mockSnack.fat      + mockDinner.fat,
    allIngredients: [
      ...mockBreakfast.ingredientsList,
      ...mockLunch.ingredientsList,
      ...mockSnack.ingredientsList,
      ...mockDinner.ingredientsList,
    ],
  };

  if (type === 'today') return [base];

  const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  return DAY_LABELS.map((label, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return { ...base, dayLabel: label, date: date.toISOString() };
  });
}
