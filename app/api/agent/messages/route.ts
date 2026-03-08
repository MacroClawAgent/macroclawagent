import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import type { AgentMessage, AgentContext } from "@/types/database";
import { callAgentChat } from "@/src/llm/gateway";

const FALLBACK_REPLY =
  "I'm having trouble connecting right now. Try asking me again in a moment — I'm here to help with your nutrition and training!";


/**
 * GET /api/agent/messages
 * Returns the last 50 chat messages + context sidebar data.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date().toISOString().split("T")[0];

    const [messagesRes, nutritionRes, goalsRes, lastActivityRes] = await Promise.all([
      supabase
        .from("chat_messages")
        .select("id,role,content,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(50),
      supabase
        .from("nutrition_logs")
        .select("calories_consumed,protein_g")
        .eq("user_id", user.id)
        .eq("date", today)
        .single(),
      supabase
        .from("users")
        .select("calorie_goal,protein_goal")
        .eq("id", user.id)
        .single(),
      supabase
        .from("activities")
        .select("name,calories,distance_meters")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })
        .limit(1)
        .single(),
    ]);

    const messages: AgentMessage[] = (messagesRes.data ?? []) as AgentMessage[];
    const context: AgentContext = {
      today_calories: nutritionRes.data?.calories_consumed ?? 0,
      today_protein: Math.round(nutritionRes.data?.protein_g ?? 0),
      calorie_goal: goalsRes.data?.calorie_goal ?? 2000,
      protein_goal: goalsRes.data?.protein_goal ?? 120,
      last_activity_name: lastActivityRes.data?.name ?? null,
      last_activity_calories: lastActivityRes.data?.calories ?? null,
      last_activity_distance_m: lastActivityRes.data?.distance_meters ?? null,
    };

    return NextResponse.json({ messages, context });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/agent/messages
 * Saves user message, generates mock AI reply, saves it, returns both.
 * Body: { content: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await request.json();
    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    // Save user message
    const { data: userMsg, error: userErr } = await supabase
      .from("chat_messages")
      .insert({ user_id: user.id, role: "user", content })
      .select("id,role,content,created_at")
      .single();
    if (userErr) throw userErr;

    // Call Claude via LLM gateway (scope-guarded, no raw Strava data)
    const agentContext = {
      today_calories: 0,
      today_protein: 0,
      calorie_goal: 2000,
      protein_goal: 120,
      last_activity_name: null as string | null,
    };
    // Fetch light context for reply
    const today = new Date().toISOString().split("T")[0];
    const [nutritionRes, goalsRes, lastActRes] = await Promise.all([
      supabase.from("nutrition_logs").select("calories_consumed,protein_g").eq("user_id", user.id).eq("date", today).maybeSingle(),
      supabase.from("users").select("calorie_goal,protein_goal").eq("id", user.id).single(),
      supabase.from("activities").select("name").eq("user_id", user.id).order("started_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    agentContext.today_calories = nutritionRes.data?.calories_consumed ?? 0;
    agentContext.today_protein = nutritionRes.data?.protein_g ?? 0;
    agentContext.calorie_goal = goalsRes.data?.calorie_goal ?? 2000;
    agentContext.protein_goal = goalsRes.data?.protein_goal ?? 120;
    agentContext.last_activity_name = lastActRes.data?.name ?? null;

    const reply = await callAgentChat(content, agentContext).catch(() => FALLBACK_REPLY);

    // Save assistant reply
    const { data: assistantMsg, error: assistantErr } = await supabase
      .from("chat_messages")
      .insert({ user_id: user.id, role: "assistant", content: reply })
      .select("id,role,content,created_at")
      .single();
    if (assistantErr) throw assistantErr;

    return NextResponse.json({
      userMessage: userMsg as AgentMessage,
      assistantMessage: assistantMsg as AgentMessage,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
