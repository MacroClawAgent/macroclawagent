/**
 * Agent Intent Detection
 *
 * Classifies user messages into typed intents so the agent can surface
 * contextual prompt chips and (in future) route to specialised handlers.
 *
 * Also detects when an AI reply is proposing a meal plan / Smart Cart action.
 */

// ── Intent types ─────────────────────────────────────────────────────────────

export type AgentIntent =
  | "ask_today_food"
  | "ask_post_workout"
  | "ask_pre_workout"
  | "ask_protein_gap"
  | "build_day_plan"
  | "build_week_plan"
  | "build_recovery_plan"
  | "build_high_protein_plan"
  | "suggest_dinner"
  | "suggest_order"
  | "convert_to_smart_cart"
  | "general";

// ── Keyword map (order matters — first match wins) ───────────────────────────

const INTENT_PATTERNS: Array<{ intent: AgentIntent; patterns: RegExp[] }> = [
  {
    intent: "convert_to_smart_cart",
    patterns: [/smart cart/i, /add.*(cart|plan)/i, /save.*(cart|plan)/i, /build.*cart/i],
  },
  {
    intent: "build_week_plan",
    patterns: [/week.*plan/i, /plan.*week/i, /this week/i, /weekly/i, /7.?day/i],
  },
  {
    intent: "build_recovery_plan",
    patterns: [/recover/i, /recovery meal/i, /after.*run/i, /after.*ride/i, /after.*workout/i, /post.?workout meal/i],
  },
  {
    intent: "build_high_protein_plan",
    patterns: [/high.?protein/i, /more protein/i, /protein.*day/i, /protein.*plan/i],
  },
  {
    intent: "build_day_plan",
    patterns: [/build.*meal/i, /meal.*today/i, /plan.*today/i, /today.*meal/i, /build.*day/i, /full day/i, /day.*plan/i],
  },
  {
    intent: "ask_post_workout",
    patterns: [/after.*train/i, /post.?workout/i, /after.*gym/i, /after.*run/i, /after.*ride/i, /refuel/i, /recover/i],
  },
  {
    intent: "ask_pre_workout",
    patterns: [/before.*train/i, /pre.?workout/i, /before.*gym/i, /before.*run/i, /before.*ride/i, /fuel.*before/i],
  },
  {
    intent: "ask_protein_gap",
    patterns: [/protein/i, /behind.*protein/i, /hit.*protein/i, /missing.*protein/i, /protein.*goal/i, /protein.*target/i],
  },
  {
    intent: "suggest_dinner",
    patterns: [/dinner/i, /supper/i, /tonight/i, /evening meal/i],
  },
  {
    intent: "suggest_order",
    patterns: [/order/i, /uber eats/i, /deliveroo/i, /takeaway/i, /takeout/i, /restaurant/i, /delivery/i],
  },
  {
    intent: "ask_today_food",
    patterns: [/what.*eat/i, /should.*eat/i, /eat.*today/i, /food.*today/i, /today.*food/i, /macros/i, /on track/i],
  },
];

// ── Intent detector ───────────────────────────────────────────────────────────

export function detectIntent(message: string): AgentIntent {
  for (const { intent, patterns } of INTENT_PATTERNS) {
    if (patterns.some((p) => p.test(message))) return intent;
  }
  return "general";
}

// ── Smart Cart signal detector ────────────────────────────────────────────────
// Returns true when the AI reply is proposing a plan and offering to save it.

const SMART_CART_SIGNALS = [
  /add.{0,20}(to )?smart cart/i,
  /save.{0,20}(to |into )?smart cart/i,
  /build.{0,20}smart cart/i,
  /turn.{0,20}(into|to).{0,20}smart cart/i,
  /want me to (add|save|build|put)/i,
  /add (this|it) to (your )?cart/i,
  /save (this|it) (to|into)/i,
  /\bi (can|could) build (you |a )?(a |your )?(meal|day|week|plan|recovery)/i,
];

export function detectSmartCartSignal(reply: string): boolean {
  return SMART_CART_SIGNALS.some((p) => p.test(reply));
}
