import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/activities
 * Returns a paginated list of activities for the authenticated user.
 *
 * Query params:
 *   type    — "Run" | "Ride" | "Swim" | "Other" (optional, filters by type)
 *   limit   — number (default 20)
 *   offset  — number (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 100);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    let query = supabase
      .from("activities")
      .select(
        "id,type,name,started_at,distance_meters,duration_seconds,calories,pace_seconds_per_km,speed_kmh,elevation_meters,avg_heart_rate",
        { count: "exact" }
      )
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq("type", type);
    }

    const { data, error, count } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ activities: data ?? [], total: count ?? 0 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
