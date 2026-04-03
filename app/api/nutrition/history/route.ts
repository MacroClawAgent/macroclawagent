import { createClient, createClientFromToken, getBearerToken } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * GET /api/nutrition/history?days=7|30|90
 * Returns daily nutrition logs for the requested range with full macros.
 */
export async function GET(request: NextRequest) {
  try {
    const token = getBearerToken(request);
    const supabase = token ? createClientFromToken(token) : await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const daysParam = parseInt(request.nextUrl.searchParams.get("days") ?? "7", 10);
    const days = [7, 30, 90].includes(daysParam) ? daysParam : 7;

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (days - 1));
    const startStr = startDate.toISOString().split("T")[0];
    const todayStr = today.toISOString().split("T")[0];

    const [logsRes, goalsRes] = await Promise.all([
      supabase
        .from("nutrition_logs")
        .select("date,calories_consumed,protein_g,carbs_g,fat_g")
        .eq("user_id", user.id)
        .gte("date", startStr)
        .lte("date", todayStr)
        .order("date", { ascending: true }),
      supabase
        .from("users")
        .select("calorie_goal,protein_goal,carbs_goal,fat_goal")
        .eq("id", user.id)
        .single(),
    ]);

    const goals = {
      calorie_goal: goalsRes.data?.calorie_goal ?? 2000,
      protein_goal: goalsRes.data?.protein_goal ?? 120,
      carbs_goal:   goalsRes.data?.carbs_goal   ?? 250,
      fat_goal:     goalsRes.data?.fat_goal      ?? 70,
    };

    // Build full date range filling gaps with 0
    const logMap = new Map(
      (logsRes.data ?? []).map((r) => [r.date, {
        kcal: r.calories_consumed ?? 0,
        protein: r.protein_g ?? 0,
        carbs: r.carbs_g ?? 0,
        fat: r.fat_g ?? 0,
      }])
    );

    const entries: {
      date: string; day: string;
      kcal: number; protein: number; carbs: number; fat: number;
      target: number;
    }[] = [];

    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const entry = logMap.get(dateStr);
      entries.push({
        date: dateStr,
        day: DAY_NAMES[d.getDay()],
        kcal: entry?.kcal ?? 0,
        protein: entry?.protein ?? 0,
        carbs: entry?.carbs ?? 0,
        fat: entry?.fat ?? 0,
        target: goals.calorie_goal,
      });
    }

    // Compute aggregates
    const logged = entries.filter(e => e.kcal > 0);
    const daysLogged = logged.length;
    const avgCalories = daysLogged > 0 ? Math.round(logged.reduce((s, e) => s + e.kcal, 0) / daysLogged) : 0;
    const avgProtein = daysLogged > 0 ? Math.round(logged.reduce((s, e) => s + e.protein, 0) / daysLogged) : 0;
    const avgCarbs = daysLogged > 0 ? Math.round(logged.reduce((s, e) => s + e.carbs, 0) / daysLogged) : 0;
    const avgFat = daysLogged > 0 ? Math.round(logged.reduce((s, e) => s + e.fat, 0) / daysLogged) : 0;
    const goalHitDays = logged.filter(e => e.kcal >= goals.calorie_goal * 0.75).length;
    const proteinHitDays = logged.filter(e => e.protein >= goals.protein_goal * 0.85).length;

    // Streak: consecutive logged days ending today
    let streak = 0;
    for (let i = entries.length - 1; i >= 0; i--) {
      if (entries[i].kcal > 0) streak++;
      else if (i === entries.length - 1) continue; // today not logged yet, skip
      else break;
    }

    return NextResponse.json({
      days: entries,
      goals,
      summary: {
        daysLogged,
        daysInRange: days,
        avgCalories,
        avgProtein,
        avgCarbs,
        avgFat,
        goalHitDays,
        proteinHitDays,
        streak,
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
