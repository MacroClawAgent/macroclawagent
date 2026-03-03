import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * POST /api/beta/signup
 * Public endpoint — no auth required.
 * Inserts a row into public.beta_signups.
 */
export async function POST(request: Request) {
  const { full_name, email, phone, sport } = await request.json();

  if (!full_name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("beta_signups").insert({
    full_name: full_name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone?.trim() || null,
    sport: sport || null,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "This email is already on the list!" }, { status: 409 });
    }
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
