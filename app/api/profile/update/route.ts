import { createClient, createClientFromToken, getBearerToken } from "@/lib/supabase/server";
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
    const token = getBearerToken(request);
    const supabase = token ? createClientFromToken(token) : await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    // Build update payload from all accepted fields
    const ALLOWED_FIELDS = [
      'full_name', 'date_of_birth', 'gender', 'weight_kg', 'height_cm',
      'unit_preference', 'avatar_url', 'profile_complete',
      'calorie_goal', 'protein_goal', 'carbs_goal', 'fat_goal', 'fitness_goal',
      'username', 'bio', 'is_public',
      // Preferences (synced from mobile)
      'dietary_requirement', 'allergies', 'cuisines', 'budget',
      'cooking_time', 'servings', 'spice_level', 'disliked_ingredients',
    ];

    const updatePayload: Record<string, unknown> = {};
    for (const key of ALLOWED_FIELDS) {
      if (body[key] !== undefined) updatePayload[key] = body[key];
    }

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
