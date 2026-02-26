import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import type { MealItem, WeeklyDay } from "@/types/database";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * GET /api/nutrition/today
 * Returns today's nutrition log, user goals, today's meal plan meals,
 * and last 7 days of calorie data for the weekly chart.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date().toISOString().split("T")[0];
    const sevenDaysAgo = new Date(Date.now() - 6 * 86400000).toISOString().split("T")[0];

    const [nutritionRes, goalsRes, mealPlanRes, weeklyRes] = await Promise.all([
      supabase
        .from("nutrition_logs")
        .select("date,calories_consumed,protein_g,carbs_g,fat_g,hydration_ml")
        .eq("user_id", user.id)
        .eq("date", today)
        .single(),
      supabase
        .from("users")
        .select("calorie_goal,protein_goal,carbs_goal,fat_goal")
        .eq("id", user.id)
        .single(),
      supabase
        .from("meal_plans")
        .select("id,meals,label,cart_status,activity_summary")
        .eq("user_id", user.id)
        .eq("date", today)
        .single(),
      supabase
        .from("nutrition_logs")
        .select("date,calories_consumed")
        .eq("user_id", user.id)
        .gte("date", sevenDaysAgo)
        .lte("date", today)
        .order("date", { ascending: true }),
    ]);

    const goals = {
      calorie_goal: goalsRes.data?.calorie_goal ?? 2000,
      protein_goal: goalsRes.data?.protein_goal ?? 120,
      carbs_goal:   goalsRes.data?.carbs_goal   ?? 250,
      fat_goal:     goalsRes.data?.fat_goal      ?? 70,
    };

    // Build 7-day weekly chart filling gaps with 0
    const logMap = new Map<string, number>(
      (weeklyRes.data ?? []).map((r) => [r.date, r.calories_consumed])
    );
    const weeklyCalories: WeeklyDay[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().split("T")[0];
      weeklyCalories.push({
        date: dateStr,
        day: DAY_NAMES[d.getDay()],
        kcal: logMap.get(dateStr) ?? 0,
        target: goals.calorie_goal,
      });
    }

    const mealLog: MealItem[] = Array.isArray(mealPlanRes.data?.meals)
      ? (mealPlanRes.data.meals as MealItem[])
      : [];

    return NextResponse.json({
      today: nutritionRes.data ?? null,
      goals,
      mealLog,
      weeklyCalories,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/nutrition/today
 * Upserts the hydration_ml field for today's nutrition log.
 * Body: { hydration_ml: number }
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { hydration_ml } = await request.json();
    if (typeof hydration_ml !== "number") {
      return NextResponse.json({ error: "hydration_ml must be a number" }, { status: 400 });
    }

    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("nutrition_logs")
      .upsert(
        { user_id: user.id, date: today, hydration_ml },
        { onConflict: "user_id,date" }
      )
      .select("hydration_ml")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ hydration_ml: data?.hydration_ml });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
