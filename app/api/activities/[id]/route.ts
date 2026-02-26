import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * PATCH /api/activities/[id]
 * Updates a single activity row owned by the authenticated user.
 * Body: partial activity fields (name, type, calories, distance_meters,
 *       duration_seconds, elevation_meters, avg_heart_rate, notes)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const {
      name,
      type,
      calories,
      distance_meters,
      duration_seconds,
      elevation_meters,
      avg_heart_rate,
      notes,
    } = body;

    const payload: Record<string, unknown> = {};
    if (name               !== undefined) payload.name               = name;
    if (type               !== undefined) payload.type               = type;
    if (calories           !== undefined) payload.calories           = Number(calories);
    if (distance_meters    !== undefined) payload.distance_meters    = Number(distance_meters);
    if (duration_seconds   !== undefined) payload.duration_seconds   = Number(duration_seconds);
    if (elevation_meters   !== undefined) payload.elevation_meters   = elevation_meters === "" ? null : Number(elevation_meters);
    if (avg_heart_rate     !== undefined) payload.avg_heart_rate     = avg_heart_rate === "" ? null : Number(avg_heart_rate);
    if (notes              !== undefined) payload.notes              = notes || null;

    const { data, error } = await supabase
      .from("activities")
      .update(payload)
      .eq("id", id)
      .eq("user_id", user.id) // RLS enforcement in query too
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ activity: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
