import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getStravaAuthUrl } from "@/lib/strava";

/**
 * GET /api/strava/connect
 * Redirects authenticated user to Strava OAuth authorization page.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL!));
    }

    return NextResponse.redirect(getStravaAuthUrl());
  } catch (err) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const isMisconfig = err instanceof Error && err.message.includes("STRAVA_CLIENT_ID");
    const param = isMisconfig ? "strava_not_configured" : "strava_error";
    return NextResponse.redirect(`${baseUrl}/settings?tab=integrations&error=${param}`);
  }
}
