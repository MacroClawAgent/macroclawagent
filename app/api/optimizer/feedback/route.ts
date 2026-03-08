import { NextRequest, NextResponse } from "next/server";
import { createClient, createClientFromToken, getBearerToken } from "@/lib/supabase/server";
import { AdherenceFeedbackSchema } from "@/src/types/optimizer";

export async function POST(request: NextRequest) {
  const token = getBearerToken(request);
  const supabase = token ? createClientFromToken(token) : await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const parsed = AdherenceFeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("adherence_feedback")
    .upsert(
      { user_id: user.id, ...parsed.data },
      { onConflict: "user_id,plan_id,day_date" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ feedback: data });
}

export async function GET(request: NextRequest) {
  const token = getBearerToken(request);
  const supabase = token ? createClientFromToken(token) : await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const planId = searchParams.get("plan_id");

  let query = supabase
    .from("adherence_feedback")
    .select("*")
    .eq("user_id", user.id)
    .order("day_date", { ascending: false })
    .limit(30);

  if (planId) query = query.eq("plan_id", planId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ feedback: data ?? [] });
}
