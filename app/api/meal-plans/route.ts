import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import type { MealItem } from "@/types/database";

/**
 * GET /api/meal-plans
 * Returns all meal plans for the authenticated user, newest first,
 * plus aggregate stats.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("meal_plans")
      .select(
        "id,date,label,activity_summary,cart_status,total_calories,total_protein,total_carbs,total_fat,uber_checkout_url,meals"
      )
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(30);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const plans = (data ?? []).map((p) => ({
      ...p,
      status: p.cart_status ?? "pending",
      meals: Array.isArray(p.meals) ? p.meals : [],
    }));

    const delivered = plans.filter((p) => p.status === "delivered");
    const deliveredMealCount = delivered.reduce(
      (acc, p) => acc + (p.meals as MealItem[]).length,
      0
    );
    const avgDailyCalories =
      plans.length > 0
        ? Math.round(plans.reduce((acc, p) => acc + (p.total_calories ?? 0), 0) / plans.length)
        : 0;

    return NextResponse.json({
      plans,
      stats: {
        total_plans: plans.length,
        delivered_count: deliveredMealCount,
        avg_daily_calories: avgDailyCalories,
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/meal-plans
 * Creates a new meal plan for today.
 * Body: { date?, label?, activity_summary?, meals, total_calories, total_protein, total_carbs, total_fat }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      date,
      label,
      activity_summary,
      meals,
      total_calories,
      total_protein,
      total_carbs,
      total_fat,
    } = body;

    const planDate = date ?? new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("meal_plans")
      .upsert(
        {
          user_id: user.id,
          date: planDate,
          label: label ?? null,
          activity_summary: activity_summary ?? null,
          meals: meals ?? [],
          total_calories: total_calories ?? 0,
          total_protein: total_protein ?? 0,
          total_carbs: total_carbs ?? 0,
          total_fat: total_fat ?? 0,
          cart_status: "pending",
        },
        { onConflict: "user_id,date" }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ plan: { ...data, status: data.cart_status } });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
