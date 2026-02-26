/**
 * MacroClawAgent — Demo Data Seed Script
 *
 * Populates a user's account with realistic athlete data so every page
 * looks fully populated immediately after schema migration.
 *
 * Usage:
 *   npx tsx scripts/seed.ts user@example.com
 *
 * Required env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";

const email = process.argv[2];
if (!email) {
  console.error("Usage: npx tsx scripts/seed.ts user@example.com");
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error(
    "Missing env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function toDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function withHour(d: Date, hour: number, minute = 0): string {
  const copy = new Date(d);
  copy.setHours(hour, minute, 0, 0);
  return copy.toISOString();
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  // 1. Lookup user
  const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) throw userError;
  const user = users.find((u) => u.email === email);
  if (!user) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }
  const userId = user.id;
  console.log(`Seeding data for user: ${email} (${userId})`);

  // 2. Clean existing data
  const thirtyDaysAgo = toDate(daysAgo(30));
  await supabase.from("chat_messages").delete().eq("user_id", userId);
  await supabase.from("activities").delete().eq("user_id", userId);
  await supabase.from("nutrition_logs").delete().eq("user_id", userId);
  await supabase.from("meal_plans").delete().eq("user_id", userId).gte("date", thirtyDaysAgo);
  console.log("Cleared existing data.");

  // 3. Insert 20 activities
  const activities = [
    { type: "Run",  name: "Morning Zone 2 Run",        started_at: withHour(daysAgo(0),  6, 45), duration_seconds: 1680, distance_meters: 5200,  calories: 312,  elevation_meters: 42,  avg_heart_rate: 148, pace_seconds_per_km: 323,  speed_kmh: null },
    { type: "Ride", name: "Evening Threshold Ride",    started_at: withHour(daysAgo(1), 17, 30), duration_seconds: 3840, distance_meters: 32100, calories: 780,  elevation_meters: 320, avg_heart_rate: 162, pace_seconds_per_km: null, speed_kmh: 30.1 },
    { type: "Run",  name: "Trail Run — Monte Serra",   started_at: withHour(daysAgo(2),  8,  0), duration_seconds: 6120, distance_meters: 12400, calories: 920,  elevation_meters: 810, avg_heart_rate: 155, pace_seconds_per_km: 494,  speed_kmh: null },
    { type: "Run",  name: "Tempo Run",                 started_at: withHour(daysAgo(3),  7,  0), duration_seconds: 2220, distance_meters: 8000,  calories: 468,  elevation_meters: 28,  avg_heart_rate: 172, pace_seconds_per_km: 278,  speed_kmh: null },
    { type: "Ride", name: "Recovery Spin",             started_at: withHour(daysAgo(4), 16,  0), duration_seconds: 2700, distance_meters: 18500, calories: 380,  elevation_meters: 95,  avg_heart_rate: 128, pace_seconds_per_km: null, speed_kmh: 24.7 },
    { type: "Run",  name: "Long Slow Distance",        started_at: withHour(daysAgo(5),  7, 30), duration_seconds: 6480, distance_meters: 16800, calories: 1050, elevation_meters: 75,  avg_heart_rate: 142, pace_seconds_per_km: 386,  speed_kmh: null },
    { type: "Swim", name: "Pool Intervals",            started_at: withHour(daysAgo(6),  7,  0), duration_seconds: 3120, distance_meters: 2400,  calories: 640,  elevation_meters: null, avg_heart_rate: 145, pace_seconds_per_km: null, speed_kmh: null },
    { type: "Run",  name: "Easy Recovery Run",         started_at: withHour(daysAgo(7),  6, 30), duration_seconds: 2280, distance_meters: 6100,  calories: 295,  elevation_meters: 22,  avg_heart_rate: 138, pace_seconds_per_km: 374,  speed_kmh: null },
    { type: "Ride", name: "Long Endurance Ride",       started_at: withHour(daysAgo(8),  8,  0), duration_seconds: 9000, distance_meters: 68000, calories: 1640, elevation_meters: 1240, avg_heart_rate: 152, pace_seconds_per_km: null, speed_kmh: 27.2 },
    { type: "Run",  name: "Hill Repeats",              started_at: withHour(daysAgo(9),  6,  0), duration_seconds: 3600, distance_meters: 7200,  calories: 510,  elevation_meters: 380, avg_heart_rate: 176, pace_seconds_per_km: 500,  speed_kmh: null },
    { type: "Run",  name: "Fartlek Session",           started_at: withHour(daysAgo(11), 7, 15), duration_seconds: 3300, distance_meters: 9500,  calories: 575,  elevation_meters: 62,  avg_heart_rate: 168, pace_seconds_per_km: 347,  speed_kmh: null },
    { type: "Ride", name: "Criterium Simulation",      started_at: withHour(daysAgo(12),16,  0), duration_seconds: 5400, distance_meters: 45000, calories: 1100, elevation_meters: 280, avg_heart_rate: 170, pace_seconds_per_km: null, speed_kmh: 30.0 },
    { type: "Run",  name: "Easy Aerobic Run",          started_at: withHour(daysAgo(13), 7,  0), duration_seconds: 3240, distance_meters: 8000,  calories: 420,  elevation_meters: 44,  avg_heart_rate: 140, pace_seconds_per_km: 405,  speed_kmh: null },
    { type: "Swim", name: "Open Water Prep",           started_at: withHour(daysAgo(14), 6, 30), duration_seconds: 2520, distance_meters: 1800,  calories: 480,  elevation_meters: null, avg_heart_rate: 148, pace_seconds_per_km: null, speed_kmh: null },
    { type: "Run",  name: "10K Race Simulation",       started_at: withHour(daysAgo(15), 8,  0), duration_seconds: 2640, distance_meters: 10000, calories: 610,  elevation_meters: 35,  avg_heart_rate: 178, pace_seconds_per_km: 264,  speed_kmh: null },
    { type: "Ride", name: "Zone 2 Endurance Ride",     started_at: withHour(daysAgo(18), 9,  0), duration_seconds: 7200, distance_meters: 55000, calories: 1280, elevation_meters: 680, avg_heart_rate: 140, pace_seconds_per_km: null, speed_kmh: 27.5 },
    { type: "Run",  name: "Warm-Up Jog",               started_at: withHour(daysAgo(19), 7,  0), duration_seconds: 1560, distance_meters: 4000,  calories: 192,  elevation_meters: 15,  avg_heart_rate: 132, pace_seconds_per_km: 390,  speed_kmh: null },
    { type: "Run",  name: "Track Intervals 400m×8",    started_at: withHour(daysAgo(20), 6, 30), duration_seconds: 2880, distance_meters: 8000,  calories: 530,  elevation_meters: 8,   avg_heart_rate: 182, pace_seconds_per_km: 360,  speed_kmh: null },
    { type: "Run",  name: "Long Run — Coast Path",     started_at: withHour(daysAgo(22), 7, 30), duration_seconds: 7800, distance_meters: 21000, calories: 1320, elevation_meters: 180, avg_heart_rate: 148, pace_seconds_per_km: 371,  speed_kmh: null },
    { type: "Ride", name: "Recovery Pedal",            started_at: withHour(daysAgo(25),15, 30), duration_seconds: 3300, distance_meters: 22000, calories: 440,  elevation_meters: 112, avg_heart_rate: 124, pace_seconds_per_km: null, speed_kmh: 24.0 },
  ].map((a) => ({ ...a, user_id: userId }));

  const { data: activityData, error: actErr } = await supabase
    .from("activities")
    .insert(activities)
    .select("id");
  if (actErr) throw actErr;
  console.log(`✓ Inserted ${activityData?.length ?? 0} activities`);

  // 4. Insert 14 nutrition logs
  const nutritionRows = [
    { days_ago: 0,  calories_consumed: 1640, protein_g: 87,  carbs_g: 180, fat_g: 44, hydration_ml: 1800 },
    { days_ago: 1,  calories_consumed: 2340, protein_g: 142, carbs_g: 280, fat_g: 68, hydration_ml: 2800 },
    { days_ago: 2,  calories_consumed: 2680, protein_g: 168, carbs_g: 310, fat_g: 78, hydration_ml: 3200 },
    { days_ago: 3,  calories_consumed: 2180, protein_g: 128, carbs_g: 256, fat_g: 58, hydration_ml: 2400 },
    { days_ago: 4,  calories_consumed: 1920, protein_g: 112, carbs_g: 224, fat_g: 52, hydration_ml: 2200 },
    { days_ago: 5,  calories_consumed: 2820, protein_g: 155, carbs_g: 340, fat_g: 82, hydration_ml: 3400 },
    { days_ago: 6,  calories_consumed: 2050, protein_g: 118, carbs_g: 238, fat_g: 56, hydration_ml: 2500 },
    { days_ago: 7,  calories_consumed: 1980, protein_g: 108, carbs_g: 230, fat_g: 54, hydration_ml: 2000 },
    { days_ago: 8,  calories_consumed: 3100, protein_g: 175, carbs_g: 380, fat_g: 88, hydration_ml: 4000 },
    { days_ago: 9,  calories_consumed: 2200, protein_g: 132, carbs_g: 258, fat_g: 61, hydration_ml: 2600 },
    { days_ago: 11, calories_consumed: 2260, protein_g: 136, carbs_g: 264, fat_g: 63, hydration_ml: 2700 },
    { days_ago: 12, calories_consumed: 2780, protein_g: 158, carbs_g: 330, fat_g: 75, hydration_ml: 3100 },
    { days_ago: 13, calories_consumed: 2100, protein_g: 122, carbs_g: 246, fat_g: 57, hydration_ml: 2300 },
    { days_ago: 14, calories_consumed: 2040, protein_g: 114, carbs_g: 234, fat_g: 55, hydration_ml: 2400 },
  ].map(({ days_ago, ...rest }) => ({
    user_id: userId,
    date: toDate(daysAgo(days_ago)),
    ...rest,
  }));

  const { data: nutritionData, error: nutErr } = await supabase
    .from("nutrition_logs")
    .upsert(nutritionRows, { onConflict: "user_id,date" })
    .select("id");
  if (nutErr) throw nutErr;
  console.log(`✓ Inserted ${nutritionData?.length ?? 0} nutrition logs`);

  // 5. Upsert 14 meal plans
  const mealPlanDefs = [
    {
      days_ago: 0, label: "Morning Run Recovery", activity_summary: "5.2km Morning Run · 312 kcal",
      status: "pending" as const,
      total_calories: 1640, total_protein: 87, total_carbs: 180, total_fat: 44,
      meals: [
        { tag: "Breakfast", name: "Green Protein Bowl",      calories: 520, protein: 34, carbs: 48, fat: 15, description: "Spinach, quinoa, poached eggs, avocado, hemp seeds", prep_time: "15 min" },
        { tag: "Lunch",     name: "Quinoa Power Salad",      calories: 480, protein: 28, carbs: 62, fat: 14, description: "Tri-color quinoa, roasted chickpeas, tahini dressing", prep_time: "10 min" },
        { tag: "Snack",     name: "Greek Yogurt + Almonds",  calories: 280, protein: 16, carbs: 18, fat: 11, description: "Full-fat Greek yogurt, honey, raw almonds", prep_time: "5 min" },
        { tag: "Dinner",    name: "Salmon & Sweet Potato",   calories: 640, protein: 45, carbs: 52, fat: 22, description: "Wild-caught salmon, roasted sweet potato, broccolini", prep_time: "25 min" },
      ],
    },
    {
      days_ago: 1, label: "Threshold Ride Day", activity_summary: "32.1km Evening Ride · 780 kcal",
      status: "delivered" as const,
      total_calories: 2340, total_protein: 142, total_carbs: 280, total_fat: 68,
      meals: [
        { tag: "Breakfast", name: "Overnight Oats + Berries",   calories: 520, protein: 24, carbs: 78, fat: 12, description: "Oats, chia seeds, almond milk, mixed berries, banana", prep_time: "5 min (prep night before)" },
        { tag: "Lunch",     name: "Chicken & Rice Bowl",         calories: 680, protein: 52, carbs: 72, fat: 18, description: "Grilled chicken, jasmine rice, broccoli, teriyaki", prep_time: "20 min" },
        { tag: "Snack",     name: "Protein Shake",               calories: 220, protein: 32, carbs: 18, fat: 4,  description: "Whey protein, banana, almond milk, ice", prep_time: "2 min" },
        { tag: "Dinner",    name: "Beef Stir Fry & Noodles",    calories: 720, protein: 48, carbs: 68, fat: 22, description: "Lean beef strips, udon noodles, pak choi, ginger soy", prep_time: "20 min" },
      ],
    },
    {
      days_ago: 2, label: "Trail Run Refuel", activity_summary: "12.4km Trail Run · 920 kcal",
      status: "ordered" as const,
      total_calories: 2680, total_protein: 168, total_carbs: 310, total_fat: 78,
      meals: [
        { tag: "Breakfast", name: "Banana + Nut Butter Toast",  calories: 420, protein: 16, carbs: 62, fat: 14, description: "Sourdough, almond butter, banana, honey drizzle", prep_time: "5 min" },
        { tag: "Lunch",     name: "Tuna Power Bowl",            calories: 580, protein: 48, carbs: 58, fat: 16, description: "Albacore tuna, brown rice, avocado, cucumber, soy", prep_time: "10 min" },
        { tag: "Snack",     name: "Greek Yogurt Parfait",       calories: 340, protein: 24, carbs: 42, fat: 8,  description: "Greek yogurt, granola, mixed berries, honey", prep_time: "5 min" },
        { tag: "Dinner",    name: "Baked Salmon & Quinoa",      calories: 760, protein: 58, carbs: 62, fat: 22, description: "Atlantic salmon, tri-color quinoa, asparagus, lemon", prep_time: "30 min" },
      ],
    },
    {
      days_ago: 3, label: "Tempo Day Performance", activity_summary: "8.0km Tempo Run · 468 kcal",
      status: "delivered" as const,
      total_calories: 2180, total_protein: 128, total_carbs: 256, total_fat: 58,
      meals: [
        { tag: "Breakfast", name: "Egg & Avocado Toast",        calories: 480, protein: 24, carbs: 44, fat: 22, description: "Sourdough, poached eggs, avocado, chilli flakes", prep_time: "10 min" },
        { tag: "Lunch",     name: "Turkey & Farro Bowl",        calories: 620, protein: 46, carbs: 68, fat: 16, description: "Ground turkey, farro, roasted veggies, tzatziki", prep_time: "25 min" },
        { tag: "Snack",     name: "Protein Bar",                calories: 280, protein: 20, carbs: 28, fat: 8,  description: "High-protein snack bar", prep_time: "0 min" },
        { tag: "Dinner",    name: "Chicken Pasta Pesto",        calories: 680, protein: 44, carbs: 72, fat: 18, description: "Grilled chicken, wholegrain pasta, basil pesto, cherry tomatoes", prep_time: "20 min" },
      ],
    },
    {
      days_ago: 4, label: "Recovery Spin Day", activity_summary: "18.5km Recovery Spin · 380 kcal",
      status: "delivered" as const,
      total_calories: 1920, total_protein: 112, total_carbs: 224, total_fat: 52,
      meals: [
        { tag: "Breakfast", name: "Veggie Omelette",            calories: 420, protein: 28, carbs: 12, fat: 22, description: "3-egg omelette, spinach, mushrooms, feta", prep_time: "10 min" },
        { tag: "Lunch",     name: "Lentil Soup & Bread",        calories: 480, protein: 24, carbs: 68, fat: 8,  description: "Red lentil soup, sourdough slice", prep_time: "15 min" },
        { tag: "Snack",     name: "Apple + Peanut Butter",      calories: 240, protein: 8,  carbs: 32, fat: 10, description: "Fuji apple, natural peanut butter", prep_time: "2 min" },
        { tag: "Dinner",    name: "Prawn Stir Fry",             calories: 580, protein: 42, carbs: 58, fat: 14, description: "King prawns, jasmine rice, bok choy, oyster sauce", prep_time: "15 min" },
      ],
    },
    {
      days_ago: 5, label: "Long Run Fuel", activity_summary: "16.8km Long Slow Distance · 1050 kcal",
      status: "delivered" as const,
      total_calories: 2820, total_protein: 155, total_carbs: 340, total_fat: 82,
      meals: [
        { tag: "Breakfast", name: "Pancakes & Berries",         calories: 620, protein: 22, carbs: 96, fat: 18, description: "Protein pancakes, maple syrup, mixed berries, yogurt", prep_time: "15 min" },
        { tag: "Lunch",     name: "Salmon Pasta",               calories: 740, protein: 48, carbs: 84, fat: 22, description: "Smoked salmon, wholegrain pasta, cream cheese, dill", prep_time: "15 min" },
        { tag: "Snack",     name: "Recovery Shake",             calories: 280, protein: 32, carbs: 28, fat: 4,  description: "Protein powder, banana, oat milk, frozen mango", prep_time: "3 min" },
        { tag: "Dinner",    name: "Chicken & Vegetable Risotto",calories: 780, protein: 52, carbs: 88, fat: 22, description: "Arborio rice, chicken breast, peas, parmesan", prep_time: "35 min" },
      ],
    },
    {
      days_ago: 6, label: "Swim Day Macros", activity_summary: "2.4km Pool Intervals · 640 kcal",
      status: "delivered" as const,
      total_calories: 2050, total_protein: 118, total_carbs: 238, total_fat: 56,
      meals: [
        { tag: "Breakfast", name: "Smoothie Bowl",              calories: 480, protein: 22, carbs: 62, fat: 14, description: "Açaí, banana, granola, chia seeds, coconut flakes", prep_time: "5 min" },
        { tag: "Lunch",     name: "Grilled Chicken Wrap",       calories: 520, protein: 38, carbs: 56, fat: 14, description: "Grilled chicken, spinach, hummus, whole wheat wrap", prep_time: "10 min" },
        { tag: "Snack",     name: "Cottage Cheese & Fruit",     calories: 220, protein: 22, carbs: 20, fat: 6,  description: "Low-fat cottage cheese, pineapple chunks", prep_time: "2 min" },
        { tag: "Dinner",    name: "Tuna Steak & Vegetables",    calories: 580, protein: 52, carbs: 28, fat: 18, description: "Seared tuna steak, green beans, cherry tomatoes", prep_time: "20 min" },
      ],
    },
    {
      days_ago: 7, label: "Easy Run Day", activity_summary: "6.1km Easy Recovery Run · 295 kcal",
      status: "delivered" as const,
      total_calories: 1980, total_protein: 108, total_carbs: 230, total_fat: 54,
      meals: [
        { tag: "Breakfast", name: "Muesli & Greek Yogurt",      calories: 440, protein: 24, carbs: 56, fat: 12, description: "Swiss muesli, full-fat Greek yogurt, honey, walnuts", prep_time: "2 min" },
        { tag: "Lunch",     name: "Lemon Chicken Salad",        calories: 520, protein: 38, carbs: 42, fat: 18, description: "Grilled chicken, mixed leaves, avocado, lemon dressing", prep_time: "10 min" },
        { tag: "Snack",     name: "Boiled Eggs × 2",            calories: 180, protein: 14, carbs: 2,  fat: 12, description: "Hard-boiled eggs, sea salt", prep_time: "8 min" },
        { tag: "Dinner",    name: "Prawn & Avocado Pasta",      calories: 640, protein: 38, carbs: 68, fat: 18, description: "King prawns, spaghetti, avocado cream sauce, parsley", prep_time: "15 min" },
      ],
    },
    {
      days_ago: 8, label: "Endurance Ride Refuel", activity_summary: "68km Long Endurance Ride · 1640 kcal",
      status: "delivered" as const,
      total_calories: 3100, total_protein: 175, total_carbs: 380, total_fat: 88,
      meals: [
        { tag: "Breakfast", name: "Big Breakfast Stack",        calories: 720, protein: 38, carbs: 64, fat: 28, description: "Scrambled eggs, turkey bacon, avocado, sourdough toast", prep_time: "15 min" },
        { tag: "Lunch",     name: "Loaded Chicken Burrito",     calories: 820, protein: 52, carbs: 88, fat: 22, description: "Grilled chicken, brown rice, black beans, salsa, sour cream", prep_time: "15 min" },
        { tag: "Snack",     name: "Protein + Banana",           calories: 320, protein: 34, carbs: 36, fat: 4,  description: "Whey protein shake, large banana", prep_time: "2 min" },
        { tag: "Dinner",    name: "Steak & Sweet Potato",       calories: 840, protein: 62, carbs: 68, fat: 28, description: "Sirloin steak, roasted sweet potato, asparagus, chimichurri", prep_time: "25 min" },
      ],
    },
    {
      days_ago: 9, label: "Hill Repeats Day", activity_summary: "7.2km Hill Repeats · 510 kcal",
      status: "delivered" as const,
      total_calories: 2200, total_protein: 132, total_carbs: 258, total_fat: 61,
      meals: [
        { tag: "Breakfast", name: "Protein Oatmeal",            calories: 480, protein: 28, carbs: 62, fat: 12, description: "Rolled oats, protein powder, almond milk, banana, cinnamon", prep_time: "5 min" },
        { tag: "Lunch",     name: "Greek Chicken Wrap",         calories: 560, protein: 42, carbs: 52, fat: 16, description: "Grilled chicken, whole wheat pita, tzatziki, cucumber, tomato", prep_time: "10 min" },
        { tag: "Snack",     name: "Trail Mix",                  calories: 280, protein: 10, carbs: 32, fat: 14, description: "Mixed nuts, dried cranberries, dark chocolate chips", prep_time: "0 min" },
        { tag: "Dinner",    name: "Baked Cod & Roasted Veg",   calories: 620, protein: 48, carbs: 52, fat: 18, description: "Baked cod fillet, roasted Mediterranean vegetables, quinoa", prep_time: "30 min" },
      ],
    },
    {
      days_ago: 11, label: "Fartlek Session Fuel", activity_summary: "9.5km Fartlek Session · 575 kcal",
      status: "delivered" as const,
      total_calories: 2260, total_protein: 136, total_carbs: 264, total_fat: 63,
      meals: [
        { tag: "Breakfast", name: "Eggs & Smoked Salmon",       calories: 460, protein: 34, carbs: 14, fat: 22, description: "Scrambled eggs, smoked salmon, capers, whole grain toast", prep_time: "10 min" },
        { tag: "Lunch",     name: "Poke Bowl",                  calories: 620, protein: 42, carbs: 72, fat: 16, description: "Sushi rice, ahi tuna, edamame, cucumber, ponzu dressing", prep_time: "10 min" },
        { tag: "Snack",     name: "Hummus & Veggie Sticks",     calories: 200, protein: 8,  carbs: 24, fat: 8,  description: "Classic hummus, carrot and celery sticks", prep_time: "3 min" },
        { tag: "Dinner",    name: "Turkey Meatballs & Pasta",   calories: 680, protein: 52, carbs: 72, fat: 18, description: "Turkey meatballs, whole wheat spaghetti, marinara sauce", prep_time: "25 min" },
      ],
    },
    {
      days_ago: 12, label: "Criterium Day Nutrition", activity_summary: "45km Criterium Simulation · 1100 kcal",
      status: "delivered" as const,
      total_calories: 2780, total_protein: 158, total_carbs: 330, total_fat: 75,
      meals: [
        { tag: "Breakfast", name: "Rice Cakes & Almond Butter", calories: 580, protein: 20, carbs: 82, fat: 18, description: "Brown rice cakes, almond butter, banana slices, honey", prep_time: "5 min" },
        { tag: "Lunch",     name: "Chicken Power Bowl",         calories: 720, protein: 54, carbs: 72, fat: 20, description: "Grilled chicken, brown rice, roasted broccoli, tahini", prep_time: "20 min" },
        { tag: "Snack",     name: "Energy Balls × 3",           calories: 300, protein: 12, carbs: 42, fat: 10, description: "Oat, peanut butter and honey energy balls", prep_time: "0 min (batch prep)" },
        { tag: "Dinner",    name: "Lamb Kofta & Tabbouleh",    calories: 780, protein: 56, carbs: 68, fat: 24, description: "Lamb kofta, bulgur wheat tabbouleh, tzatziki, flatbread", prep_time: "30 min" },
      ],
    },
    {
      days_ago: 13, label: "Easy Run Recovery", activity_summary: "8.0km Easy Aerobic Run · 420 kcal",
      status: "delivered" as const,
      total_calories: 2100, total_protein: 122, total_carbs: 246, total_fat: 57,
      meals: [
        { tag: "Breakfast", name: "Bircher Muesli",             calories: 420, protein: 18, carbs: 58, fat: 12, description: "Soaked oats, grated apple, yogurt, raisins, cinnamon", prep_time: "2 min (soak overnight)" },
        { tag: "Lunch",     name: "Beef & Quinoa Salad",        calories: 580, protein: 44, carbs: 54, fat: 16, description: "Lean beef strips, quinoa, rocket, cherry tomatoes, balsamic", prep_time: "15 min" },
        { tag: "Snack",     name: "Cheese & Crackers",          calories: 260, protein: 12, carbs: 28, fat: 12, description: "Cottage cheese, whole grain crackers, cucumber slices", prep_time: "3 min" },
        { tag: "Dinner",    name: "Tofu Stir Fry",              calories: 640, protein: 36, carbs: 72, fat: 18, description: "Crispy tofu, jasmine rice, mixed vegetables, sesame sauce", prep_time: "20 min" },
      ],
    },
    {
      days_ago: 14, label: "Swim & Rest Day", activity_summary: "1.8km Open Water Prep · 480 kcal",
      status: "delivered" as const,
      total_calories: 2040, total_protein: 114, total_carbs: 234, total_fat: 55,
      meals: [
        { tag: "Breakfast", name: "Avocado Toast & Eggs",       calories: 460, protein: 24, carbs: 42, fat: 20, description: "Sourdough, mashed avocado, poached eggs, everything bagel seasoning", prep_time: "10 min" },
        { tag: "Lunch",     name: "Minestrone Soup",            calories: 440, protein: 22, carbs: 58, fat: 10, description: "Hearty vegetable minestrone, cannellini beans, sourdough", prep_time: "10 min (ready-made)" },
        { tag: "Snack",     name: "Fruit & Nut Mix",            calories: 240, protein: 8,  carbs: 28, fat: 12, description: "Dried apricots, cashews, almonds, dark chocolate", prep_time: "0 min" },
        { tag: "Dinner",    name: "Sea Bass & Lentils",         calories: 680, protein: 54, carbs: 52, fat: 18, description: "Pan-seared sea bass, puy lentils, roasted cherry tomatoes", prep_time: "25 min" },
      ],
    },
  ];

  const mealPlanRows = mealPlanDefs.map(({ days_ago, meals, ...rest }) => ({
    user_id: userId,
    date: toDate(daysAgo(days_ago)),
    meals,
    ...rest,
  }));

  const { data: mealData, error: mealErr } = await supabase
    .from("meal_plans")
    .upsert(mealPlanRows, { onConflict: "user_id,date" })
    .select("id");
  if (mealErr) throw mealErr;
  console.log(`✓ Inserted ${mealData?.length ?? 0} meal plans`);

  // 6. Insert sample chat messages
  const chatMessages = [
    {
      user_id: userId, role: "assistant",
      content: "Hey! I'm your Claw Agent. I've analyzed your morning run — you burned 312 kcal at Zone 2. Your protein is 33g short of today's target. Want me to build a recovery meal plan and add it to your Uber Eats cart?",
      created_at: new Date(Date.now() - 60000 * 5).toISOString(),
    },
    {
      user_id: userId, role: "user",
      content: "Yes please, build me a recovery meal plan.",
      created_at: new Date(Date.now() - 60000 * 4).toISOString(),
    },
    {
      user_id: userId, role: "assistant",
      content: "I've generated your meal plan for today: Green Protein Bowl (breakfast), Quinoa Power Salad (lunch), Greek Yogurt + Almonds (snack), and Salmon & Sweet Potato (dinner). Total: 1,640 kcal, 87g protein. Shall I build your Uber Eats cart?",
      created_at: new Date(Date.now() - 60000 * 3).toISOString(),
    },
    {
      user_id: userId, role: "user",
      content: "How many calories did I burn this week?",
      created_at: new Date(Date.now() - 60000 * 2).toISOString(),
    },
    {
      user_id: userId, role: "assistant",
      content: "This week you burned 2,480 kcal across 4 activities. Your 7-day average is 620 kcal/session — 12% above last week. Great consistency! Your highest output was the Trail Run — Monte Serra at 920 kcal.",
      created_at: new Date(Date.now() - 60000 * 1).toISOString(),
    },
  ];

  const { data: chatData, error: chatErr } = await supabase
    .from("chat_messages")
    .insert(chatMessages)
    .select("id");
  if (chatErr) throw chatErr;
  console.log(`✓ Inserted ${chatData?.length ?? 0} chat messages`);

  console.log("\n✅ Seed complete. Run your app and log in to see real data.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
