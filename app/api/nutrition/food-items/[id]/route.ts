import { createClient, createClientFromToken, getBearerToken } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * DELETE /api/nutrition/food-items/[id]
 * Removes a food log item and recomputes nutrition_logs totals for that day.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getBearerToken(request);
    const supabase = token ? createClientFromToken(token) : await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // Fetch item first to get the date (needed for totals recompute)
    const { data: existing, error: fetchErr } = await supabase
      .from("food_log_items")
      .select("log_date")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    if (fetchErr || !existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const log_date = existing.log_date;

    // Delete the item
    const { error: deleteErr } = await supabase
      .from("food_log_items")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (deleteErr) throw deleteErr;

    // Recompute totals from remaining items
    const { data: allItems } = await supabase
      .from("food_log_items")
      .select("calories,protein_g,carbs_g,fat_g")
      .eq("user_id", user.id)
      .eq("log_date", log_date);

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

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
