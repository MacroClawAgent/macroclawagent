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
