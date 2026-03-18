import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/** GET /api/users/by-username?username=xxx
 *  Returns { email } — used by sign-in to look up email from username
 */
export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username")?.toLowerCase().trim();
  if (!username) return NextResponse.json({ error: "Missing username" }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("email")
    .eq("username", username)
    .maybeSingle();

  if (error || !data?.email) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ email: data.email });
}
