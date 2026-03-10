import { createClient, createClientFromToken, getBearerToken } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/nutrition/food-items?date=YYYY-MM-DD
 * Returns all food log items for the given date (defaults to today).
 */
export async function GET(request: NextRequest) {
  try {
    const token = getBearerToken(request);
    const supabase = token ? createClientFromToken(token) : await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const date = request.nextUrl.searchParams.get("date") ?? new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("food_log_items")
      .select("id,meal_tag,name,calories,protein_g,carbs_g,fat_g,created_at")
      .eq("user_id", user.id)
      .eq("log_date", date)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ items: data ?? [] });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/nutrition/food-items
 * Adds a food item and upserts the nutrition_logs totals for that day.
 * Body: { meal_tag, name, calories, protein_g, carbs_g, fat_g, date? }
 */
export async function POST(request: NextRequest) {
  try {
    const token = getBearerToken(request);
    const supabase = token ? createClientFromToken(token) : await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { meal_tag, name, calories, protein_g, carbs_g, fat_g } = body;
    const log_date: string = body.date ?? new Date().toISOString().split("T")[0];

    if (!meal_tag || !name || calories == null) {
      return NextResponse.json({ error: "meal_tag, name, and calories are required" }, { status: 400 });
    }

    // Insert the food item
    const { data: item, error: insertErr } = await supabase
      .from("food_log_items")
      .insert({ user_id: user.id, log_date, meal_tag, name, calories, protein_g: protein_g ?? 0, carbs_g: carbs_g ?? 0, fat_g: fat_g ?? 0 })
      .select()
      .single();
    if (insertErr) throw insertErr;

    // Recompute totals from all items for that day
    const { data: allItems, error: sumErr } = await supabase
      .from("food_log_items")
      .select("calories,protein_g,carbs_g,fat_g")
      .eq("user_id", user.id)
      .eq("log_date", log_date);
    if (sumErr) throw sumErr;

    const totals = (allItems ?? []).reduce(
      (acc, r) => ({
        calories_consumed: acc.calories_consumed + (r.calories ?? 0),
        protein_g: acc.protein_g + Number(r.protein_g ?? 0),
        carbs_g: acc.carbs_g + Number(r.carbs_g ?? 0),
        fat_g: acc.fat_g + Number(r.fat_g ?? 0),
      }),
      { calories_consumed: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
    );

    await supabase
      .from("nutrition_logs")
      .upsert({ user_id: user.id, date: log_date, ...totals }, { onConflict: "user_id,date" });

    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
