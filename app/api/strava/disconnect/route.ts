import { createClient, createClientFromToken } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * DELETE /api/strava/disconnect
 * Removes the user's stored Strava tokens and athlete ID.
 */
export async function DELETE(req: NextRequest) {
  try {
    const bearer = req.headers.get("authorization")?.replace("Bearer ", "");
    const supabase = bearer ? await createClientFromToken(bearer) : await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("users")
      .update({
        strava_athlete_id: null,
        strava_access_token: null,
        strava_refresh_token: null,
        strava_token_expires_at: null,
      })
      .eq("id", user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
