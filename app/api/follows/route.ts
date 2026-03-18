import { createClient, getBearerToken, createClientFromToken } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/** POST /api/follows  body: { following_id }  — follow a user */
export async function POST(request: NextRequest) {
  const token = getBearerToken(request);
  const supabase = token ? createClientFromToken(token) : await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { following_id } = await request.json();
  if (!following_id) return NextResponse.json({ error: "Missing following_id" }, { status: 400 });
  if (following_id === user.id) return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });

  const { error } = await supabase.from("follows").insert({ follower_id: user.id, following_id });
  if (error && error.code !== "23505") { // ignore duplicate
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/** DELETE /api/follows?following_id=xxx — unfollow a user */
export async function DELETE(request: NextRequest) {
  const token = getBearerToken(request);
  const supabase = token ? createClientFromToken(token) : await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const following_id = request.nextUrl.searchParams.get("following_id");
  if (!following_id) return NextResponse.json({ error: "Missing following_id" }, { status: 400 });

  await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", following_id);
  return NextResponse.json({ ok: true });
}

/** GET /api/follows?type=following|followers — returns user profiles */
export async function GET(request: NextRequest) {
  const token = getBearerToken(request);
  const supabase = token ? createClientFromToken(token) : await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const type = request.nextUrl.searchParams.get("type") ?? "following";

  if (type === "followers") {
    // People who follow me
    const { data } = await supabase
      .from("follows")
      .select("follower_id, users!follows_follower_id_fkey(id, username, full_name, bio, avatar_url, fitness_goal, is_public)")
      .eq("following_id", user.id);
    const users = (data ?? []).map((r: any) => r.users).filter(Boolean);
    return NextResponse.json({ users });
  }

  // People I follow
  const { data } = await supabase
    .from("follows")
    .select("following_id, users!follows_following_id_fkey(id, username, full_name, bio, avatar_url, fitness_goal, is_public)")
    .eq("follower_id", user.id);
  const users = (data ?? []).map((r: any) => r.users).filter(Boolean);
  // Also return just IDs for quick lookup
  const ids = (data ?? []).map((r: any) => r.following_id);
  return NextResponse.json({ users, ids });
}
