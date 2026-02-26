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
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
