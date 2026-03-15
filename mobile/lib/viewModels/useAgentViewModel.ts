import { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { apiGet, apiPost } from "../api";
import type { ActivityRow, NutritionLog, UserProfile } from "../../types";

export interface AgentMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ActivityContext {
  type: string;
  durationMin: number;
  kcal: number;
}

export interface AgentViewModel {
  messages: AgentMessage[];
  input: string;
  setInput: (s: string) => void;
  send: () => Promise<void>;
  quickSend: (text: string) => Promise<void>;
  sending: boolean;
  loading: boolean;
  showFollowUps: boolean;
  macroContext: {
    protein: number;
    proteinTarget: number;
    calories: number;
    caloriesTarget: number;
  };
  activityContext: ActivityContext | null;
  suggestedPrompts: string[];
  pendingSmartCartAction: boolean;
  confirmSmartCart: () => void;
  dismissSmartCart: () => void;
}

// ── Dynamic prompt chip derivation ──────────────────────────────────────────

function derivePrompts(
  proteinRemaining: number,
  hasActivity: boolean,
  hasPlan: boolean
): string[] {
  if (hasActivity) {
    return [
      "What should I eat after training?",
      "Build a recovery plan",
      "Am I hitting my macros?",
      "Build today's meals",
    ];
  }
  if (proteinRemaining > 20) {
    return [
      "How do I hit protein today?",
      "High-protein dinner ideas",
      "Build today's meals",
      "What should I eat now?",
    ];
  }
  if (!hasPlan) {
    return [
      "Build today's meals",
      "Create this week's plan",
      "What should I eat today?",
      "Make a Smart Cart",
    ];
  }
  return [
    "What should I eat today?",
    "Am I behind on protein?",
    "Build a Smart Cart",
    "Suggest a high-protein dinner",
  ];
}

// ── Welcome message derivation ───────────────────────────────────────────────

function deriveWelcome(
  firstName: string,
  proteinPct: number,
  caloriePct: number,
  hasActivity: boolean
): AgentMessage {
  let content: string;

  if (hasActivity) {
    content = `Hey ${firstName}! Looks like you've been training. Want me to set up your recovery nutrition or build your meals for the rest of the day?`;
  } else if (proteinPct > 0 && proteinPct < 50) {
    content = `Hey ${firstName}! You've hit ${proteinPct}% of your protein today. Want me to suggest some meals to close the gap?`;
  } else if (caloriePct > 80) {
    content = `Hey ${firstName}! You're at ${caloriePct}% of your calories for today. Want suggestions for a lighter dinner?`;
  } else {
    content = `Hey ${firstName}! I'm Jonno, your nutrition coach. I can help with meal planning, hitting your macros, or fuelling your training. What do you need?`;
  }

  return {
    id: "welcome",
    role: "assistant",
    content,
    created_at: new Date().toISOString(),
  };
}

// ── View model ───────────────────────────────────────────────────────────────

export function useAgentViewModel(): AgentViewModel {
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingSmartCartAction, setPendingSmartCartAction] = useState(false);
  const [activityContext, setActivityContext] = useState<ActivityContext | null>(null);
  const [macroContext, setMacroContext] = useState({
    protein: 0,
    proteinTarget: userProfile?.protein_goal ?? 120,
    calories: 0,
    caloriesTarget: userProfile?.calorie_goal ?? 2000,
  });
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([
    "What should I eat today?",
    "Am I behind on protein?",
    "Build today's meals",
    "What should I eat after training?",
  ]);

  // Init: fetch nutrition + latest activity to seed context (no chat history)
  useEffect(() => {
    async function init() {
      try {
        const [nutritionRes, activityRes] = await Promise.allSettled([
          apiGet<{ log: NutritionLog; goals: UserProfile }>("/api/nutrition/today"),
          apiGet<{ activities: ActivityRow[] }>("/api/activities?limit=1"),
        ]);

        let proteinPct = 0;
        let caloriePct = 0;
        let hasActivity = false;
        let firstName = userProfile?.full_name?.split(" ")[0] ?? "there";

        if (nutritionRes.status === "fulfilled") {
          const { log, goals } = nutritionRes.value;
          const proteinConsumed = Math.round(log?.protein_g ?? 0);
          const proteinTarget = goals?.protein_goal ?? 120;
          const caloriesConsumed = log?.calories_consumed ?? 0;
          const caloriesTarget = goals?.calorie_goal ?? 2000;

          proteinPct = proteinTarget > 0 ? Math.round((proteinConsumed / proteinTarget) * 100) : 0;
          caloriePct = caloriesTarget > 0 ? Math.round((caloriesConsumed / caloriesTarget) * 100) : 0;

          setMacroContext({
            protein: proteinConsumed,
            proteinTarget,
            calories: caloriesConsumed,
            caloriesTarget,
          });
        }

        if (activityRes.status === "fulfilled") {
          const latest = activityRes.value?.activities?.[0];
          if (latest) {
            hasActivity = true;
            setActivityContext({
              type: latest.type ?? "Workout",
              durationMin: Math.round((latest.duration_seconds ?? 0) / 60),
              kcal: latest.calories ?? 0,
            });
          }
        }

        const proteinRemaining = macroContext.proteinTarget - macroContext.protein;
        const hasPlan = false; // conservative default — backend will know on each send

        setMessages([deriveWelcome(firstName, proteinPct, caloriePct, hasActivity)]);
        setSuggestedPrompts(derivePrompts(proteinRemaining, hasActivity, hasPlan));
      } catch {
        // fallback to static welcome
        const name = userProfile?.full_name?.split(" ")[0] ?? "there";
        setMessages([{
          id: "welcome",
          role: "assistant",
          content: `Hey ${name}! I'm Jonno, your nutrition coach. Ask me what to eat, how to hit your macros, or to build a meal plan.`,
          created_at: new Date().toISOString(),
        }]);
      } finally {
        setLoading(false);
      }
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text || sending) return;
    setSending(true);
    setPendingSmartCartAction(false);

    const tempId = `temp_${Date.now()}`;
    const tempMsg: AgentMessage = {
      id: tempId,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await apiPost<{ reply: string; intent: string; suggestSmartCart: boolean }>(
        "/api/agent/chat",
        { message: text }
      );

      const assistantMsg: AgentMessage = {
        id: `assistant_${Date.now()}`,
        role: "assistant",
        content: res.reply,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) =>
        prev.filter((m) => m.id !== tempId).concat([
          { ...tempMsg, id: `user_${Date.now() - 1}` },
          assistantMsg,
        ])
      );

      if (res.suggestSmartCart) {
        setPendingSmartCartAction(true);
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSending(false);
    }
  }, [sending]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    await sendMessage(text);
  }, [input, sendMessage]);

  const quickSend = useCallback(async (text: string) => {
    await sendMessage(text.trim());
  }, [sendMessage]);

  const confirmSmartCart = useCallback(() => {
    setPendingSmartCartAction(false);
    router.push("/(tabs)/cart");
  }, []);

  const dismissSmartCart = useCallback(() => {
    setPendingSmartCartAction(false);
  }, []);

  const showFollowUps = messages.length > 1 && !sending && !pendingSmartCartAction;

  return {
    messages,
    input,
    setInput,
    send,
    quickSend,
    sending,
    loading,
    showFollowUps,
    macroContext,
    activityContext,
    suggestedPrompts,
    pendingSmartCartAction,
    confirmSmartCart,
    dismissSmartCart,
  };
}
