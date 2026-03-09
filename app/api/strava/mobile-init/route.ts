import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getBearerToken, createClientFromToken } from "@/lib/supabase/server";
import { getStravaAuthUrlWithState } from "@/lib/strava";

/**
 * GET /api/strava/mobile-init
 * Called by the mobile app (Bearer token auth) to initiate Strava OAuth.
 * Returns { url } — the Strava authorize URL with a signed state token so
 * the callback can identify the user without a browser session cookie.
 */
export async function GET(req: NextRequest) {
  const token = getBearerToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClientFromToken(token);
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = signMobileState(user.id);
  const url = getStravaAuthUrlWithState(state);

  return NextResponse.json({ url });
}

// ── State signing (HMAC-SHA256, stateless, 10-min expiry) ─────────────────────

export function signMobileState(uid: string): string {
  const t = Date.now();
  const payload = `${uid}:${t}`;
  const sig = createHmac("sha256", process.env.STRAVA_CLIENT_SECRET ?? "fallback")
    .update(payload)
    .digest("hex")
    .slice(0, 16);
  return Buffer.from(payload).toString("base64url") + "." + sig;
}

export function verifyMobileState(state: string): string | null {
  try {
    const dotIdx = state.lastIndexOf(".");
    if (dotIdx === -1) return null;
    const encoded = state.slice(0, dotIdx);
    const sig = state.slice(dotIdx + 1);
    const payload = Buffer.from(encoded, "base64url").toString();
    const parts = payload.split(":");
    if (parts.length < 2) return null;
    const t = parseInt(parts[parts.length - 1], 10);
    const uid = parts.slice(0, -1).join(":");
    if (Date.now() - t > 10 * 60 * 1000) return null; // expired
    const expected = createHmac("sha256", process.env.STRAVA_CLIENT_SECRET ?? "fallback")
      .update(payload)
      .digest("hex")
      .slice(0, 16);
    if (sig !== expected) return null;
    return uid;
  } catch {
    return null;
  }
}
