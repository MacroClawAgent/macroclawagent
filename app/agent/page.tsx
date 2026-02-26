"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/app/AppShell";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { Sparkles, Send, Bot, Activity, Flame, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { AgentMessage, AgentContext } from "@/types/database";

const INITIAL_MESSAGE: AgentMessage = {
  id: "initial",
  role: "assistant",
  content: "Hey! I'm your Claw Agent. Ask me anything about your nutrition, training, or meal planning.",
  created_at: new Date().toISOString(),
};

const suggestedPrompts = [
  "What should I eat after my run?",
  "Build my meal plan for today",
  "How many calories did I burn this week?",
  "Suggest high-protein meals under $20",
  "Optimize my macros for tomorrow's race",
  "What's my weekly training load?",
];

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AgentPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [messages, setMessages] = useState<AgentMessage[]>([INITIAL_MESSAGE]);
  const [context, setContext] = useState<AgentContext | null>(null);
  const [contextLoading, setContextLoading] = useState(true);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) { setAuthorized(true); return; }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      setAuthorized(true);
    });
  }, [router]);

  useEffect(() => {
    if (!authorized) return;
    fetch("/api/agent/messages")
      .then((r) => r.json())
      .then(({ messages: dbMessages, context: ctx }) => {
        if (dbMessages && dbMessages.length > 0) setMessages(dbMessages as AgentMessage[]);
        setContext(ctx as AgentContext);
      })
      .catch(console.error)
      .finally(() => setContextLoading(false));
  }, [authorized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const sendMessage = async (text?: string) => {
    const content = text ?? input.trim();
    if (!content || thinking) return;
    setInput("");
    setThinking(true);

    // Optimistically add user message
    const tempId = `tmp-${Date.now()}`;
    const optimisticUser: AgentMessage = {
      id: tempId,
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);

    try {
      const res = await fetch("/api/agent/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const { userMessage, assistantMessage } = await res.json();
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempId),
        userMessage,
        assistantMessage,
      ]);
    } catch {
      // Keep the optimistic message on failure
    } finally {
      setThinking(false);
    }
  };

  if (!authorized) return null;

  // Context sidebar derived values
  const calorieGoal = context?.calorie_goal ?? 2000;
  const proteinGoal = context?.protein_goal ?? 120;
  const carbsGoal = 250;
  const todayCals = context?.today_calories ?? 0;
  const todayProtein = context?.today_protein ?? 0;
  const todayCarbs = 0; // not in context yet, show 0
  const macros = [
    { label: "Calories", val: `${todayCals.toLocaleString()}`,  target: calorieGoal.toLocaleString(), pct: calorieGoal > 0 ? Math.min(Math.round((todayCals / calorieGoal) * 100), 100) : 0, color: "#F97316" },
    { label: "Protein",  val: `${todayProtein}g`,               target: `${proteinGoal}g`,           pct: proteinGoal > 0 ? Math.min(Math.round((todayProtein / proteinGoal) * 100), 100) : 0, color: "#10B981" },
    { label: "Carbs",    val: `${todayCarbs}g`,                  target: `${carbsGoal}g`,              pct: 0, color: "#F59E0B" },
  ];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-8 h-[calc(100vh-12rem)]">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">

          {/* Left sidebar: context panel */}
          <div className="hidden lg:flex flex-col gap-4">
            <div>
              <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-1">Claw Agent</p>
              <h1 className="text-xl font-black text-slate-100">AI Assistant</h1>
            </div>

            {/* Current macros summary */}
            <div className="glass-card p-4 rounded-xl">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Today&apos;s Macros</p>
              {contextLoading ? (
                [0,1,2].map((i) => <Skeleton key={i} className="h-6 mb-2" />)
              ) : (
                macros.map((m) => (
                  <div key={m.label} className="mb-2.5">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">{m.label}</span>
                      <span className="text-slate-400 font-mono">{m.val}/{m.target}</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${m.pct}%`, backgroundColor: m.color }} />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Last activity */}
            <div className="glass-card p-4 rounded-xl">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Last Activity</p>
              {contextLoading ? (
                <Skeleton className="h-12" />
              ) : context?.last_activity_name ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-orange-400" />
                    <p className="text-sm font-bold text-slate-100">{context.last_activity_name}</p>
                  </div>
                  {context.last_activity_calories && (
                    <div className="flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      <span className="text-xs text-orange-400 font-semibold">{context.last_activity_calories} kcal</span>
                      {context.last_activity_distance_m && (
                        <span className="text-xs text-slate-600 ml-1">· {(context.last_activity_distance_m / 1000).toFixed(1)} km</span>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-slate-600">No recent activities</p>
              )}
            </div>

            {/* Suggested prompts */}
            <div className="glass-card p-4 rounded-xl flex-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Quick Questions</p>
              <div className="flex flex-col gap-2">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] hover:border-indigo-500/20 transition-all text-left"
                  >
                    <ChevronRight className="w-3 h-3 flex-shrink-0 text-indigo-500" />
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: chat panel */}
          <div className="lg:col-span-3 flex flex-col glass-card rounded-2xl overflow-hidden">
            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.07]">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-100">Claw Agent</p>
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online · Powered by Claude AI
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4 min-h-0">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                  )}
                  <div className={`max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-indigo-600 text-white rounded-tr-sm"
                          : "bg-white/[0.05] text-slate-300 rounded-tl-sm border border-white/[0.06]"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <p className="text-[10px] text-slate-600 px-1">{formatTime(msg.created_at)}</p>
                  </div>
                </motion.div>
              ))}

              {/* Thinking indicator */}
              <AnimatePresence>
                {thinking && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="flex gap-3"
                  >
                    <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <div className="bg-white/[0.05] rounded-2xl rounded-tl-sm border border-white/[0.06] px-4 py-3 flex items-center gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div className="p-4 border-t border-white/[0.07]">
              {/* Mobile suggested prompts */}
              <div className="lg:hidden flex gap-2 overflow-x-auto pb-3 scrollbar-none">
                {suggestedPrompts.slice(0, 3).map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-slate-400 hover:text-slate-200 hover:bg-white/[0.08] transition-all"
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 bg-white/[0.04] rounded-xl px-4 py-3 border border-white/[0.08] focus-within:border-indigo-500/40 transition-colors">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Ask the Claw anything about your nutrition or training…"
                  className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 outline-none"
                  disabled={thinking}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || thinking}
                  className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
