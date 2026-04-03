import { createClient, createClientFromToken, getBearerToken } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/nutrition/food-items?date=YYYY-MM-DD
 * Returns all food log items for the given date (defaults to today).
 *
 * GET /api/nutrition/food-items?distinct=true
 * Returns unique dishes the user has logged, with latest macros and log count.
 */
export async function GET(request: NextRequest) {
  try {
    const token = getBearerToken(request);
    const supabase = token ? createClientFromToken(token) : await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // ── Distinct dishes mode ─────────────────────────────────────────────────
    if (request.nextUrl.searchParams.get("distinct") === "true") {
      const { data: rows, error: distErr } = await supabase
        .from("food_log_items")
        .select("dish_name,name,meal_tag,calories,protein_g,carbs_g,fat_g,log_date,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(500);

      if (distErr) throw distErr;

      // Group by dish_name (or name fallback), keep latest entry's macros + count
      const map = new Map<string, {
        name: string; meal_tag: string;
        calories: number; protein_g: number; carbs_g: number; fat_g: number;
        last_logged: string; times_logged: number;
      }>();
      for (const r of rows ?? []) {
        const key = (r.dish_name || r.name || "").toLowerCase().trim();
        if (!key) continue;
        const existing = map.get(key);
        if (existing) {
          existing.times_logged += 1;
        } else {
          map.set(key, {
            name: r.dish_name || r.name,
            meal_tag: r.meal_tag,
            calories: r.calories ?? 0,
            protein_g: Number(r.protein_g ?? 0),
            carbs_g: Number(r.carbs_g ?? 0),
            fat_g: Number(r.fat_g ?? 0),
            last_logged: r.log_date,
            times_logged: 1,
          });
        }
      }

      const dishes = Array.from(map.values())
        .sort((a, b) => b.times_logged - a.times_logged);

      return NextResponse.json({ dishes });
    }

    // ── Standard date-based mode ─────────────────────────────────────────────
    const date = request.nextUrl.searchParams.get("date") ?? new Date().toISOString().split("T")[0];

    let { data, error } = await supabase
      .from("food_log_items")
      .select("id,meal_tag,name,calories,protein_g,carbs_g,fat_g,batch_id,dish_name,created_at")
      .eq("user_id", user.id)
      .eq("log_date", date)
      .order("created_at", { ascending: true });

    // If columns don't exist yet (migration pending), fall back to base columns
    if (error?.code === "42703") {
      const fallback = await supabase
        .from("food_log_items")
        .select("id,meal_tag,name,calories,protein_g,carbs_g,fat_g,created_at")
        .eq("user_id", user.id)
        .eq("log_date", date)
        .order("created_at", { ascending: true });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data = fallback.data as any;
      error = fallback.error;
    }

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
    const { meal_tag, name, calories, protein_g, carbs_g, fat_g, batch_id, dish_name } = body;
    const log_date: string = body.date ?? new Date().toISOString().split("T")[0];

    if (!meal_tag || !name || calories == null) {
      return NextResponse.json({ error: "meal_tag, name, and calories are required" }, { status: 400 });
    }

    // Insert the food item (with batch/dish fields; fallback if columns missing)
    // Round all macro values to integers — DB columns are INTEGER type
    const baseRow = {
      user_id: user.id,
      log_date,
      meal_tag,
      name,
      calories:   Math.round(Number(calories)),
      protein_g:  Math.round(Number(protein_g ?? 0)),
      carbs_g:    Math.round(Number(carbs_g  ?? 0)),
      fat_g:      Math.round(Number(fat_g    ?? 0)),
    };
    let { data: item, error: insertErr } = await supabase
      .from("food_log_items")
      .insert({ ...baseRow, ...(batch_id ? { batch_id } : {}), ...(dish_name ? { dish_name } : {}) })
      .select()
      .single();
    if (insertErr?.code === "42703") {
      // batch_id/dish_name columns not migrated yet — insert without them
      ({ data: item, error: insertErr } = await supabase
        .from("food_log_items")
        .insert(baseRow)
        .select()
        .single());
    }
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
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : (err as { message?: string })?.message ?? "Internal server error";
    console.error("[food-items POST]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * DELETE /api/nutrition/food-items?batch_id=UUID&date=YYYY-MM-DD
 * Deletes all food_log_items for the given batch_id (or a single item by id),
 * then recomputes nutrition_logs totals for that day.
 */
export async function DELETE(request: NextRequest) {
  try {
    const token = getBearerToken(request);
    const supabase = token ? createClientFromToken(token) : await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const batch_id = request.nextUrl.searchParams.get("batch_id");
    const log_date: string = request.nextUrl.searchParams.get("date") ?? new Date().toISOString().split("T")[0];

    if (!batch_id) {
      return NextResponse.json({ error: "batch_id is required" }, { status: 400 });
    }

    const { error: delErr } = await supabase
      .from("food_log_items")
      .delete()
      .eq("user_id", user.id)
      .eq("batch_id", batch_id);
    if (delErr) throw delErr;

    // Recompute totals
    const { data: remaining, error: sumErr } = await supabase
      .from("food_log_items")
      .select("calories,protein_g,carbs_g,fat_g")
      .eq("user_id", user.id)
      .eq("log_date", log_date);
    if (sumErr) throw sumErr;

    const totals = (remaining ?? []).reduce(
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

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : (err as { message?: string })?.message ?? "Internal server error";
    console.error("[food-items DELETE]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
