import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForTokens,
  fetchStravaActivities,
  mapStravaActivity,
} from "@/lib/strava";

/**
 * GET /api/strava/callback
 * Handles the OAuth redirect from Strava, exchanges the code for tokens,
 * saves them to public.users, runs an initial activity sync, then
 * redirects back to the Integrations settings tab.
 */
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const settingsUrl = `${baseUrl}/settings?tab=integrations`;

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${settingsUrl}&error=strava_denied`);
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.redirect(`${baseUrl}/login`);
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Save tokens + athlete ID to public.users
    const { error: updateError } = await supabase
      .from("users")
      .update({
        strava_athlete_id: String(tokens.athlete.id),
        strava_access_token: tokens.access_token,
        strava_refresh_token: tokens.refresh_token,
        strava_token_expires_at: new Date(tokens.expires_at * 1000).toISOString(),
      })
      .eq("id", user.id);

    if (updateError) throw updateError;

    // Initial sync — import up to 30 most recent activities
    try {
      const rawActivities = await fetchStravaActivities(tokens.access_token, 30);
      const rows = rawActivities.map((a) => mapStravaActivity(a, user.id));
      if (rows.length > 0) {
        await supabase
          .from("activities")
          .upsert(rows, { onConflict: "strava_activity_id" });
      }
    } catch {
      // Non-fatal: token saved, sync can be retried manually
    }

    return NextResponse.redirect(`${settingsUrl}&connected=true`);
  } catch {
    return NextResponse.redirect(`${settingsUrl}&error=strava_error`);
  }
}
