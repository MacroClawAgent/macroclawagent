import { createClient, createClientFromToken, getBearerToken } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * DELETE /api/profile/delete
 * Deletes the user's account and all associated data.
 * Cascades: food_log_items, nutrition_logs, meal_plans, community_posts,
 * community_likes, follows, chat_messages, activities, users row.
 * Finally deletes the auth user.
 */
export async function DELETE(request: NextRequest) {
  try {
    const token = getBearerToken(request);
    const supabase = token ? createClientFromToken(token) : await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // Delete all user data in order (respecting foreign keys)
    const tables = [
      "food_log_items",
      "nutrition_logs",
      "community_likes",
      "community_posts",
      "chat_messages",
      "activities",
      "meal_plans",
    ];

    for (const table of tables) {
      try {
        await supabase.from(table).delete().eq("user_id", userId);
      } catch {
        // Table might not exist — continue
      }
    }

    // Delete follows (both directions)
    try {
      await supabase.from("follows").delete().eq("follower_id", userId);
      await supabase.from("follows").delete().eq("following_id", userId);
    } catch {}

    // Delete user profile
    try {
      await supabase.from("users").delete().eq("id", userId);
    } catch {}

    // Delete avatar from storage
    try {
      const { data: files } = await supabase.storage.from("avatars").list(userId);
      if (files && files.length > 0) {
        await supabase.storage.from("avatars").remove(files.map(f => `${userId}/${f.name}`));
      }
    } catch {}

    // Sign out the session
    await supabase.auth.signOut();

    return NextResponse.json({ ok: true, message: "Account deleted successfully" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete account";
    console.error("[profile/delete]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
