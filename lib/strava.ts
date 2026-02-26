/**
 * MacroClawAgent — Strava API helpers
 * Centralises all OAuth and activity-fetching logic.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number; // unix seconds
  athlete: { id: number; firstname: string; lastname: string };
}

export interface StravaActivity {
  id: number;
  name: string;
  sport_type: string;
  start_date: string;        // ISO 8601
  moving_time: number;       // seconds
  distance: number;          // meters
  total_elevation_gain: number;
  average_heartrate?: number;
  average_speed: number;     // m/s
  kilojoules?: number;       // for rides
  calories?: number;
}

export interface ActivityInsert {
  user_id: string;
  strava_activity_id: string;
  type: "Run" | "Ride" | "Swim" | "Other";
  name: string;
  started_at: string;
  duration_seconds: number;
  distance_meters: number;
  calories: number;
  elevation_meters: number | null;
  avg_heart_rate: number | null;
  pace_seconds_per_km: number | null;
  speed_kmh: number | null;
}

// ── Auth URL ──────────────────────────────────────────────────────────────────

export function getStravaAuthUrl(): string {
  const clientId = process.env.STRAVA_CLIENT_ID!;
  const redirectUri = process.env.STRAVA_REDIRECT_URI!;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    approval_prompt: "auto",
    scope: "activity:read_all",
  });
  return `https://www.strava.com/oauth/authorize?${params.toString()}`;
}

// ── Token exchange ────────────────────────────────────────────────────────────

export async function exchangeCodeForTokens(
  code: string
): Promise<StravaTokenResponse> {
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Strava token exchange failed: ${text}`);
  }
  return res.json() as Promise<StravaTokenResponse>;
}

// ── Token refresh ─────────────────────────────────────────────────────────────

export async function refreshStravaToken(
  refreshToken: string
): Promise<StravaTokenResponse> {
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Strava token refresh failed: ${text}`);
  }
  return res.json() as Promise<StravaTokenResponse>;
}

// ── Get valid access token (auto-refresh if expired) ─────────────────────────

export async function getValidAccessToken(
  userId: string,
  supabase: SupabaseClient
): Promise<string | null> {
  const { data: userData } = await supabase
    .from("users")
    .select("strava_access_token, strava_refresh_token, strava_token_expires_at")
    .eq("id", userId)
    .single();

  if (!userData?.strava_access_token || !userData?.strava_refresh_token) {
    return null; // not connected
  }

  const expiresAt = userData.strava_token_expires_at
    ? new Date(userData.strava_token_expires_at).getTime() / 1000
    : 0;
  const nowUnix = Math.floor(Date.now() / 1000);

  // Refresh if expiring within 5 minutes
  if (expiresAt - nowUnix < 300) {
    const refreshed = await refreshStravaToken(userData.strava_refresh_token);
    await supabase
      .from("users")
      .update({
        strava_access_token: refreshed.access_token,
        strava_refresh_token: refreshed.refresh_token,
        strava_token_expires_at: new Date(refreshed.expires_at * 1000).toISOString(),
      })
      .eq("id", userId);
    return refreshed.access_token;
  }

  return userData.strava_access_token;
}

// ── Fetch activities from Strava ──────────────────────────────────────────────

export async function fetchStravaActivities(
  accessToken: string,
  perPage = 30
): Promise<StravaActivity[]> {
  const res = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?per_page=${perPage}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Strava activities fetch failed: ${text}`);
  }
  return res.json() as Promise<StravaActivity[]>;
}

// ── Map Strava activity → DB row ──────────────────────────────────────────────

export function mapStravaActivity(
  raw: StravaActivity,
  userId: string
): ActivityInsert {
  // Map sport_type to our DB enum
  let type: "Run" | "Ride" | "Swim" | "Other" = "Other";
  let name = raw.name;

  if (raw.sport_type === "Run" || raw.sport_type === "TrailRun" || raw.sport_type === "VirtualRun") {
    type = "Run";
  } else if (
    raw.sport_type === "Ride" ||
    raw.sport_type === "VirtualRide" ||
    raw.sport_type === "MountainBikeRide" ||
    raw.sport_type === "GravelRide"
  ) {
    type = "Ride";
  } else if (raw.sport_type === "Swim" || raw.sport_type === "OpenWaterSwim") {
    type = "Swim";
  } else if (raw.sport_type === "WeightTraining") {
    type = "Other";
    name = `Macroclaw Strength: ${raw.name}`;
  }

  // Estimate calories: Strava provides kilojoules for rides (1 kJ ≈ 1 kcal for cycling efficiency)
  // For other activities use a rough estimate if calories not provided
  const calories = raw.calories
    ? Math.round(raw.calories)
    : raw.kilojoules
    ? Math.round(raw.kilojoules)
    : Math.round(raw.moving_time / 60 * 8); // ~8 kcal/min fallback

  const speedKmh = raw.average_speed * 3.6;
  const paceSecPerKm =
    type === "Run" && raw.average_speed > 0
      ? Math.round(1000 / raw.average_speed)
      : null;

  return {
    user_id: userId,
    strava_activity_id: String(raw.id),
    type,
    name,
    started_at: raw.start_date,
    duration_seconds: raw.moving_time,
    distance_meters: raw.distance,
    calories,
    elevation_meters: raw.total_elevation_gain > 0 ? raw.total_elevation_gain : null,
    avg_heart_rate: raw.average_heartrate ? Math.round(raw.average_heartrate) : null,
    pace_seconds_per_km: paceSecPerKm,
    speed_kmh: type !== "Run" ? Math.round(speedKmh * 10) / 10 : null,
  };
}
