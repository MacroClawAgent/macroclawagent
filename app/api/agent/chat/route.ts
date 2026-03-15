import { createClient, createClientFromToken, getBearerToken } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { buildAgentContext } from "@/src/agent/buildAgentContext";
import { buildAgentSystemPrompt } from "@/src/agent/buildSystemPrompt";
import { detectIntent, detectSmartCartSignal } from "@/src/agent/agentIntents";
import { callAgentWithContext } from "@/src/llm/gateway";

/**
 * POST /api/agent/chat
 *
 * Stateless, context-aware agent endpoint for the mobile app.
 * Builds fresh user context on every request — no chat history stored.
 *
 * Flow:
 *   1. Auth (Bearer token or cookie)
 *   2. Build FullAgentContext from live DB data (6 parallel queries)
 *   3. Inject context into system prompt
 *   4. Detect user intent
 *   5. Call Claude with context-rich system prompt
 *   6. Detect if reply proposes a Smart Cart action
 *   7. Return { reply, intent, suggestSmartCart } — NO DB writes
 */
export async function POST(request: NextRequest) {
  try {
    const token = getBearerToken(request);
    const supabase = token ? createClientFromToken(token) : await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    // Build fresh context and system prompt
    const ctx = await buildAgentContext(user.id, supabase);
    const systemPrompt = buildAgentSystemPrompt(ctx);
    const intent = detectIntent(message);

    // Call Claude
    const reply = await callAgentWithContext(message, systemPrompt);

    // Detect if reply is offering a Smart Cart / plan action
    const suggestSmartCart = detectSmartCartSignal(reply);

    return NextResponse.json({ reply, intent, suggestSmartCart });
  } catch (err) {
    console.error("[agent/chat] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
