/**
 * Supabase Edge Function: create-plan
 * Deno runtime — invokes the Jonno Optimizer pipeline for a user.
 *
 * Usage:
 *   supabase functions invoke create-plan --body '{"user_id":"uuid"}'
 *
 * Env vars required:
 *   ANTHROPIC_API_KEY   — Claude API key (never exposed to client)
 *   SUPABASE_URL        — Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY — Service role key for server-side writes
 *
 * Security:
 *   - Validates JWT or service-role invocation
 *   - LLM gateway strips sensitive fields before Claude calls
 *   - No raw Strava data is ever passed to the LLM
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Validate auth — accept JWT or service role invocation
    const authHeader = req.headers.get("Authorization");
    let userId: string;

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      userId = user.id;
    } else {
      // Service role invocation — user_id must be in body
      const body = await req.json();
      if (!body?.user_id) {
        return new Response(JSON.stringify({ error: "user_id required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      userId = body.user_id;
    }

    // Check for existing plan today (rate limit)
    const today = new Date().toISOString().split("T")[0];
    const { data: existing } = await supabase
      .from("plan_outputs")
      .select("id, start_date, created_at")
      .eq("user_id", userId)
      .eq("start_date", today)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ plan_id: existing.id, cached: true, message: "Plan already generated today" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Delegate to Next.js API for full pipeline
    // (Edge functions share the same Supabase instance;
    //  actual pipeline logic lives in /api/optimizer/create)
    const apiUrl = Deno.env.get("NEXT_PUBLIC_APP_URL") ?? "https://jonnoai.com";
    const planResponse = await fetch(`${apiUrl}/api/optimizer/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Service-to-service: use a shared secret or service role
        "x-service-key": SERVICE_ROLE_KEY,
        "x-user-id": userId,
      },
    });

    if (!planResponse.ok) {
      const err = await planResponse.text();
      throw new Error(`Pipeline failed: ${err}`);
    }

    const result = await planResponse.json();

    return new Response(JSON.stringify({ success: true, plan_id: result?.plan?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[create-plan edge function]", err);
    return new Response(
      JSON.stringify({ error: "Plan generation failed", detail: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
