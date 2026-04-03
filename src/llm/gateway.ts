/**
 * LLM Gateway — Validated, Redacted, Scope-Guarded Claude Calls
 *
 * COMPLIANCE:
 * - All inputs validated against LLMRequestSchema (Zod strips unknown keys)
 * - Sensitive fields (tokens, secrets, raw Strava) are redacted pre-call
 * - Scope enforced: only recipe_steps | explanation | substitution
 * - Graceful degradation: returns null on repeated LLM failure (caller uses deterministic output)
 * - Tool calls (macro_check, allergy_check) executed server-side — never by client
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  LLMRequest,
  LLMRequestSchema,
  LLMResponse,
  LLMResponseSchema,
} from "../types/optimizer";
import {
  SYSTEM_PROMPT,
  DEVELOPER_PROMPT_RECIPE,
  DEVELOPER_PROMPT_EXPLANATION,
  DEVELOPER_PROMPT_SUBSTITUTION,
  buildUserPrompt,
} from "./prompts";
import { TOOL_DEFINITIONS, dispatchTool } from "./tools";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 4096;
const MAX_RETRIES = 2;

// Fields that must never appear in LLM request payloads
const REDACTED_KEYS = new Set([
  "token", "secret", "key", "password", "api_key",
  "access_token", "refresh_token", "strava_raw", "strava_access_token",
  "hr_stream", "gps", "gps_data", "streams", "segment_efforts",
]);

// ── Redaction ─────────────────────────────────────────────────

function redactSensitive(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (REDACTED_KEYS.has(k.toLowerCase())) {
      result[k] = "[REDACTED]";
    } else if (v && typeof v === "object" && !Array.isArray(v)) {
      result[k] = redactSensitive(v as Record<string, unknown>);
    } else {
      result[k] = v;
    }
  }
  return result;
}

// ── Scope Enforcement ─────────────────────────────────────────

const ALLOWED_TYPES = new Set(["recipe_steps", "explanation", "substitution"]);

function enforceScope(requestType: string): void {
  if (!ALLOWED_TYPES.has(requestType)) {
    throw new Error(`LLM_SCOPE_VIOLATION: request_type "${requestType}" is not permitted`);
  }
}

// ── Developer Prompt Selector ─────────────────────────────────

function getDeveloperPrompt(requestType: string): string {
  if (requestType === "recipe_steps") return DEVELOPER_PROMPT_RECIPE;
  if (requestType === "substitution") return DEVELOPER_PROMPT_SUBSTITUTION;
  return DEVELOPER_PROMPT_EXPLANATION;
}

// ── Tool Call Handler ─────────────────────────────────────────

async function handleToolCalls(
  client: Anthropic,
  messages: Anthropic.MessageParam[],
  response: Anthropic.Message,
  developerPrompt: string
): Promise<string> {
  let current = response;

  // Agentic loop — handle up to 5 tool rounds
  for (let round = 0; round < 5; round++) {
    if (current.stop_reason !== "tool_use") break;

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of current.content) {
      if (block.type === "tool_use") {
        const result = dispatchTool(block.name, block.input as Record<string, unknown>);
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(result),
        });
      }
    }

    messages.push({ role: "assistant", content: current.content });
    messages.push({ role: "user", content: toolResults });

    current = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: [
        { type: "text", text: SYSTEM_PROMPT },
        { type: "text", text: developerPrompt },
      ],
      tools: TOOL_DEFINITIONS,
      messages,
    });
  }

  // Extract final text
  const textBlock = current.content.find((b) => b.type === "text");
  return textBlock && textBlock.type === "text" ? textBlock.text : "";
}

// ── Main Gateway Function ─────────────────────────────────────

export async function callLLM(rawRequest: unknown): Promise<LLMResponse | null> {
  // 1. Validate + strip unknown keys (Zod .strict() drops raw Strava fields)
  const parseResult = LLMRequestSchema.safeParse(rawRequest);
  if (!parseResult.success) {
    console.error("[LLM Gateway] Invalid request schema:", parseResult.error.message);
    return null;
  }
  const request: LLMRequest = parseResult.data;

  // 2. Scope check
  enforceScope(request.request_type);

  // 3. Redact any sensitive fields that slipped through
  const safePreferences = redactSensitive(
    request.preferences as unknown as Record<string, unknown>
  );

  // 4. Build messages
  const userContent = buildUserPrompt(
    request.request_type,
    request.meals,
    request.grocery_list,
    request.daily_targets,
    safePreferences as typeof request.preferences
  );

  const developerPrompt = getDeveloperPrompt(request.request_type);
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userContent },
  ];

  // 5. Call Claude with retries
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn("[LLM Gateway] ANTHROPIC_API_KEY not set — skipping LLM call");
    return null;
  }

  const client = new Anthropic({ apiKey });

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: [
          { type: "text", text: SYSTEM_PROMPT },
          { type: "text", text: developerPrompt },
        ],
        tools: request.request_type === "substitution" ? TOOL_DEFINITIONS : [],
        messages,
      });

      let rawText: string;
      if (response.stop_reason === "tool_use") {
        rawText = await handleToolCalls(client, messages, response, developerPrompt);
      } else {
        const textBlock = response.content.find((b) => b.type === "text");
        rawText = textBlock && textBlock.type === "text" ? textBlock.text : "";
      }

      // 6. Parse + validate output schema
      let parsed: unknown;
      try {
        // Strip markdown code fences if present
        const cleaned = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
        parsed = JSON.parse(cleaned);
      } catch {
        if (attempt === MAX_RETRIES) {
          console.error("[LLM Gateway] Failed to parse LLM JSON after", MAX_RETRIES, "attempts");
          return null;
        }
        continue;
      }

      const validated = LLMResponseSchema.safeParse(parsed);
      if (!validated.success) {
        if (attempt === MAX_RETRIES) {
          console.error("[LLM Gateway] LLM output schema mismatch:", validated.error.message);
          return null;
        }
        continue;
      }

      return validated.data;
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        console.error("[LLM Gateway] Claude API error:", err);
        return null;
      }
    }
  }

  return null;
}

// ── Agent Chat Gateway (legacy — used by web /api/agent/messages) ─────────
// Simplified gateway for free-form agent chat (not plan generation).
// Scope guard still enforced via system prompt.

export async function callAgentChat(
  userMessage: string,
  context: Record<string, unknown>
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return "I'm not available right now — please try again later.";

  // Ensure no raw Strava or sensitive data in context
  const safeContext = redactSensitive(context);

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Context (your data for today):\n${JSON.stringify(safeContext, null, 2)}\n\nUser message: ${userMessage}`,
        },
      ],
    });
    const textBlock = response.content.find((b) => b.type === "text");
    return textBlock && textBlock.type === "text"
      ? textBlock.text
      : "I couldn't generate a response. Please try again.";
  } catch (err) {
    console.error("[LLM Gateway] Agent chat error:", err);
    return "I'm having trouble right now. Please try again in a moment.";
  }
}

// ── Context-Aware Agent Gateway ───────────────────────────────────────────
// Used by the new /api/agent/chat route (mobile app).
// Takes a fully-built system prompt with injected user context rather than
// assembling a shallow context blob inline. Shorter max_tokens for app-native
// concise responses.

// ── Food Vision Gateway ────────────────────────────────────────────────────
// Sends a meal photo to Claude Vision and returns detected foods with macros.

export interface DetectedFood {
  name: string;
  grams: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  per100g: { calories: number; protein_g: number; carbs_g: number; fat_g: number };
}

export interface FoodAnalysisResult {
  foods: DetectedFood[];
  totals: { calories: number; protein_g: number; carbs_g: number; fat_g: number };
  error?: string;
}

const FOOD_VISION_SYSTEM = `You are an accredited sports dietitian with 15 years of experience in food photography analysis and portion estimation. You use the Australian NUTTAB and USDA FoodData Central databases for nutritional values. You are extremely precise and methodical.`;

const FOOD_VISION_PROMPT = `Analyse this meal photo using the following step-by-step process.

STEP 1 — IDENTIFY
List every distinct food item visible. Include:
- Main proteins (chicken breast, salmon fillet, tofu, etc.)
- Carb sources (rice, pasta, bread, potato, etc.)
- Vegetables and salads (individual items, not "mixed salad")
- Sauces, dressings, oils, butter (these are OFTEN missed — look carefully)
- Beverages if visible
- Garnishes (cheese, nuts, seeds, avocado)

STEP 2 — ESTIMATE PORTION (grams)
Use these visual references:
- Standard dinner plate = 26cm diameter. Estimate what fraction each food fills.
- A fist-sized portion ≈ 150g cooked rice/pasta, 180g potato
- A palm-sized portion ≈ 120-150g cooked meat/fish
- A thumb-sized portion ≈ 15g butter/cheese
- A cupped hand ≈ 40g nuts, 80g cooked vegetables
- A thin drizzle of oil ≈ 5-10ml (4.5-9g)
- Sauce pooled on plate ≈ 30-50g
- If the portion looks generous, estimate UP. If it looks small, estimate DOWN.
- Do NOT default to 100g — estimate the ACTUAL visible portion.

STEP 3 — LOOK UP per100g VALUES
Use standard nutritional reference data (NUTTAB / USDA):
- Cooked chicken breast: 165 kcal, 31g P, 0g C, 3.6g F per 100g
- Cooked white rice: 130 kcal, 2.7g P, 28g C, 0.3g F per 100g
- Cooked salmon: 208 kcal, 20g P, 0g C, 13g F per 100g
- Raw vegetables (broccoli, spinach): 25-35 kcal per 100g
- Olive oil: 884 kcal, 0g P, 0g C, 100g F per 100g
- Use COOKED values for cooked foods (not raw weight).

STEP 4 — COMPUTE ABSOLUTE VALUES
For each food: absolute = per100g × (grams / 100). Round to 1 decimal.
CROSS-CHECK: the absolute values MUST equal per100g × grams / 100. If they don't match, fix them.

STEP 5 — COMPUTE TOTALS
Sum all foods. The totals must equal the sum of individual items exactly.
Sanity check: a typical meal is 400-800 kcal. A snack is 150-350 kcal. A large restaurant meal can be 800-1200 kcal. If your total seems way off, re-examine portions.

Return ONLY valid JSON (no markdown fences, no explanation):
{
  "foods": [
    {
      "name": "Grilled chicken breast",
      "grams": 150,
      "calories": 247.5,
      "protein_g": 46.5,
      "carbs_g": 0.0,
      "fat_g": 5.4,
      "per100g": { "calories": 165, "protein_g": 31.0, "carbs_g": 0.0, "fat_g": 3.6 }
    }
  ],
  "totals": { "calories": 247.5, "protein_g": 46.5, "carbs_g": 0.0, "fat_g": 5.4 }
}`;

export async function analyzeFoodImage(
  imageBase64: string,
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" = "image/jpeg"
): Promise<FoodAnalysisResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { foods: [], totals: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }, error: "AI not configured" };
  }

  const client = new Anthropic({ apiKey });

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 2048,
        temperature: 0.2,
        system: FOOD_VISION_SYSTEM,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mimeType, data: imageBase64 } },
              { type: "text", text: FOOD_VISION_PROMPT },
            ],
          },
        ],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") throw new Error("No text response");

      const raw = textBlock.text.trim();
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");

      const parsed = JSON.parse(jsonMatch[0]) as FoodAnalysisResult;

      // Validate: cross-check per100g × grams matches absolute values
      if (parsed.foods?.length > 0) {
        let valid = true;
        for (const f of parsed.foods) {
          if (!f.per100g || !f.grams || f.grams <= 0) { valid = false; break; }
          const expectedCal = Math.round(f.per100g.calories * f.grams / 100 * 10) / 10;
          if (Math.abs(expectedCal - f.calories) > f.calories * 0.15) { valid = false; break; }
        }
        // Recompute totals from individual foods (don't trust LLM addition)
        parsed.totals = parsed.foods.reduce(
          (acc, f) => ({
            calories: Math.round((acc.calories + f.calories) * 10) / 10,
            protein_g: Math.round((acc.protein_g + f.protein_g) * 10) / 10,
            carbs_g: Math.round((acc.carbs_g + f.carbs_g) * 10) / 10,
            fat_g: Math.round((acc.fat_g + f.fat_g) * 10) / 10,
          }),
          { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
        );
        if (valid || attempt === 2) return parsed;
        // Retry on validation failure
        continue;
      }

      return parsed;
    } catch (err) {
      if (attempt === 2) {
        console.error("[LLM Gateway] analyzeFoodImage error:", err);
        return {
          foods: [],
          totals: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
          error: "Couldn't detect foods in this photo. Please add items manually.",
        };
      }
    }
  }

  return { foods: [], totals: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }, error: "Analysis failed." };
}

// ── Pantry / Fridge Vision Gateway ────────────────────────────────────────────
// Sends a fridge or pantry photo to Claude Vision and returns a list of
// ingredient names for the user to confirm before saving to their pantry.

export async function scanPantryImage(
  imageBase64: string,
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" = "image/jpeg"
): Promise<{ items: string[]; error?: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { items: [], error: "AI not configured" };
  }

  const client = new Anthropic({ apiKey });

  const prompt = `Look at this photo of a fridge, pantry or kitchen. Identify every visible food item, ingredient, condiment, beverage and produce.
Return ONLY valid JSON with a single "items" array of clean ingredient name strings. No markdown, no extra text:
{
  "items": ["Chicken breast", "Greek yoghurt", "Spinach", "Eggs", "Cheddar cheese", "Milk"]
}
Rules:
- Use simple generic names (not brands unless the item is only known by brand, e.g. "Vegemite")
- If you can clearly see a quantity, include it briefly e.g. "Eggs × 6"
- One entry per distinct ingredient type
- Maximum 30 items
- If you cannot identify food items in this photo, return { "items": [] }`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mimeType, data: imageBase64 } },
            { type: "text", text: prompt },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") throw new Error("No text response");

    const raw = textBlock.text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");

    const parsed = JSON.parse(jsonMatch[0]) as { items?: unknown };
    const items = Array.isArray(parsed.items)
      ? (parsed.items as unknown[]).filter((i): i is string => typeof i === "string")
      : [];

    return { items };
  } catch (err) {
    console.error("[LLM Gateway] scanPantryImage error:", err);
    return { items: [], error: "Couldn't read this photo — please add items manually." };
  }
}

export async function callAgentWithContext(
  userMessage: string,
  systemPrompt: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return "I'm not available right now — please try again later.";

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 600,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });
    const textBlock = response.content.find((b) => b.type === "text");
    return textBlock && textBlock.type === "text"
      ? textBlock.text
      : "I couldn't generate a response. Please try again.";
  } catch (err) {
    console.error("[LLM Gateway] callAgentWithContext error:", err);
    return "I'm having trouble right now. Please try again in a moment.";
  }
}
