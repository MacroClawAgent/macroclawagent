import { NextRequest, NextResponse } from "next/server";
import { createClient, createClientFromToken, getBearerToken } from "@/lib/supabase/server";
import { createPlan } from "@/src/pipeline/create_plan";

export async function POST(request: NextRequest) {
  const token = getBearerToken(request);
  const supabase = token ? createClientFromToken(token) : await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: return cached plan if one was created today
  const today = new Date().toISOString().split("T")[0];
  const { data: existing } = await supabase
    .from("plan_outputs")
    .select("*")
    .eq("user_id", user.id)
    .eq("start_date", today)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ plan: existing, cached: true });
  }

  try {
    const plan = await createPlan(user.id, supabase);
    return NextResponse.json({ plan, cached: false });
  } catch (err) {
    console.error("[optimizer/create]", err);
    return NextResponse.json({ error: "Plan generation failed" }, { status: 500 });
  }
}

// GET returns the most recent plan for the user
export async function GET(request: NextRequest) {
  const token = getBearerToken(request);
  const supabase = token ? createClientFromToken(token) : await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: plan, error } = await supabase
    .from("plan_outputs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ plan: plan ?? null });
}
