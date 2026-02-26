import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  getValidAccessToken,
  fetchStravaActivities,
  mapStravaActivity,
} from "@/lib/strava";

/**
 * POST /api/strava/sync
 * Syncs the authenticated user's latest Strava activities into public.activities.
 * Auto-refreshes the access token if expired.
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = await getValidAccessToken(user.id, supabase);
    if (!accessToken) {
      return NextResponse.json(
        { error: "Strava not connected. Connect via Settings → Integrations." },
        { status: 400 }
      );
    }

    const rawActivities = await fetchStravaActivities(accessToken, 30);
    if (rawActivities.length === 0) {
      return NextResponse.json({ synced: 0 });
    }

    const rows = rawActivities.map((a) => mapStravaActivity(a, user.id));
    const { data, error: upsertError } = await supabase
      .from("activities")
      .upsert(rows, { onConflict: "strava_activity_id" })
      .select("id");

    if (upsertError) throw upsertError;

    return NextResponse.json({ synced: data?.length ?? 0 });
  } catch (err) {
    console.error("Strava sync error:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
