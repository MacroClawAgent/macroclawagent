import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/profile/update
 *
 * Updates the current user's health profile in public.users.
 * Body: { full_name, date_of_birth, gender, weight_kg, height_cm,
 *         unit_preference, avatar_url, profile_complete }
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
      full_name,
      date_of_birth,
      gender,
      weight_kg,
      height_cm,
      unit_preference,
      avatar_url,
      profile_complete,
    } = body;

    const updatePayload: Record<string, unknown> = {};
    if (full_name !== undefined) updatePayload.full_name = full_name;
    if (date_of_birth !== undefined) updatePayload.date_of_birth = date_of_birth;
    if (gender !== undefined) updatePayload.gender = gender;
    if (weight_kg !== undefined) updatePayload.weight_kg = weight_kg;
    if (height_cm !== undefined) updatePayload.height_cm = height_cm;
    if (unit_preference !== undefined) updatePayload.unit_preference = unit_preference;
    if (avatar_url !== undefined) updatePayload.avatar_url = avatar_url;
    if (profile_complete !== undefined) updatePayload.profile_complete = profile_complete;

    const { data, error } = await supabase
      .from("users")
      .update(updatePayload)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
