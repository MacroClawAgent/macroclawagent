import { createClient, createClientFromToken, getBearerToken } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { analyzeFoodImage } from "@/src/llm/gateway";

/**
 * POST /api/food/analyze
 *
 * Sends a meal photo to Claude Vision and returns detected foods with macro estimates.
 * Body: { imageBase64: string, mimeType?: "image/jpeg" | "image/png" | "image/webp" }
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
    const { imageBase64, mimeType = "image/jpeg" } = body;

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json({ error: "imageBase64 required" }, { status: 400 });
    }

    const result = await analyzeFoodImage(imageBase64, mimeType);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
