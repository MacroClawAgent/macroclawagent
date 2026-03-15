import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiGet, apiPost } from "../api";
import type { NutritionLog, UserProfile } from "../../types";

export interface AgentMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface AgentViewModel {
  messages: AgentMessage[];
  input: string;
  setInput: (s: string) => void;
  send: () => Promise<void>;
  sending: boolean;
  loading: boolean;
  macroContext: {
    protein: number;
    proteinTarget: number;
    calories: number;
    caloriesTarget: number;
  };
  suggestedPrompts: string[];
}

const SUGGESTED_PROMPTS = [
  "What should I eat after training?",
  "Am I behind on protein?",
  "Build today's meals",
  "What should I order tonight?",
];

const WELCOME: AgentMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm Jonno, your AI nutrition coach. Ask me anything about your macros, meal planning, or training fuelling. 💪",
  created_at: new Date().toISOString(),
};

export function useAgentViewModel(): AgentViewModel {
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState<AgentMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [macroContext, setMacroContext] = useState({
    protein: 0,
    proteinTarget: userProfile?.protein_goal ?? 120,
    calories: 0,
    caloriesTarget: userProfile?.calorie_goal ?? 2000,
  });

  useEffect(() => {
    async function init() {
      try {
        const [historyRes, nutritionRes] = await Promise.allSettled([
          apiGet<{ messages: AgentMessage[] }>("/api/agent/messages"),
          apiGet<{ log: NutritionLog; goals: UserProfile }>("/api/nutrition/today"),
        ]);

        if (historyRes.status === "fulfilled" && historyRes.value.messages?.length) {
          setMessages(historyRes.value.messages);
        }
        if (nutritionRes.status === "fulfilled") {
          const { log, goals } = nutritionRes.value;
          setMacroContext({
            protein: log?.protein_g ?? 0,
            proteinTarget: goals?.protein_goal ?? 120,
            calories: log?.calories_consumed ?? 0,
            caloriesTarget: goals?.calorie_goal ?? 2000,
          });
        }
      } catch {
        // keep defaults
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);

    const tempId = `temp_${Date.now()}`;
    const tempMsg: AgentMessage = {
      id: tempId,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await apiPost<{ userMessage: AgentMessage; assistantMessage: AgentMessage }>(
        "/api/agent/messages",
        { content: text }
      );
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== tempId)
          .concat([res.userMessage, res.assistantMessage])
      );
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSending(false);
    }
  }, [input, sending]);

  return {
    messages,
    input,
    setInput,
    send,
    sending,
    loading,
    macroContext,
    suggestedPrompts: SUGGESTED_PROMPTS,
  };
}
