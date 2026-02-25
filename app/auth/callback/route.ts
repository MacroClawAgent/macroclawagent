import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /auth/callback
 *
 * Handles the OAuth and email confirmation redirect from Supabase.
 * Supabase sends the user here after they click a magic link or
 * complete Google OAuth. We exchange the code for a session.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return to login with error state if something went wrong
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
