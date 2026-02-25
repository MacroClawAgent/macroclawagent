import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /auth/callback
 *
 * Handles the OAuth and email confirmation redirect from Supabase.
 * After code exchange, redirects to /onboarding if the user hasn't
 * completed their health profile yet, otherwise to /dashboard.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Check if user has completed their health profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("profile_complete")
          .eq("id", user.id)
          .single();

        // New users or incomplete profiles → onboarding
        if (!profile || !profile.profile_complete) {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return to login with error state if something went wrong
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
