import { NextRequest } from "next/server";

/**
 * POST /api/strava/sync
 *
 * Placeholder for Strava activity sync.
 * In production: validates user session, fetches activities from Strava API
 * using the user's stored OAuth token, stores them in Supabase, and
 * returns the latest activities for meal planning.
 *
 * To activate: provide STRAVA_CLIENT_ID + STRAVA_CLIENT_SECRET in .env.local
 */
export const runtime = "edge";

export async function POST(_request: NextRequest) {
  return Response.json(
    {
      status: "ok",
      message:
        "Strava sync placeholder — connect your STRAVA_CLIENT_ID to enable real syncing.",
      data: null,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
