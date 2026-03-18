import { createClient, getBearerToken, createClientFromToken } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/** GET /api/users/search?q=username
 *  Returns matching public users (excluding self)
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.toLowerCase().trim();
  if (!q || q.length < 2) return NextResponse.json({ users: [] });

  const token = getBearerToken(request);
  const supabase = token ? createClientFromToken(token) : await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("users")
    .select("id, username, full_name, bio, avatar_url, fitness_goal, is_public")
    .ilike("username", `${q}%`)
    .neq("id", user.id)
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ users: data ?? [] });
}
