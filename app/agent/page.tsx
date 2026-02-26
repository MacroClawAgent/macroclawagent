"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/app/AppShell";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { Sparkles, Send, Bot, Activity, Flame, ChevronRight } from "lucide-react";

interface ChatMessage {
  id: number;
  role: "assistant" | "user";
  content: string;
  time: string;
}

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    role: "assistant",
    content: "Hey! I'm your Claw Agent. I've analyzed your morning run — you burned 312 kcal at Zone 2. Your protein is 33g short of today's target. Want me to build a recovery meal plan and add it to your Uber Eats cart?",
    time: "Just now",
  },
];

const suggestedPrompts = [
  "What should I eat after my run?",
  "Build my meal plan for today",
  "How many calories did I burn this week?",
  "Suggest high-protein meals under $20",
  "Optimize my macros for tomorrow's race",
  "What's my weekly training load?",
];

const agentReplies = [
  "Based on your 5.2km run this morning, I recommend increasing protein by 30g today. I've found 3 options on Uber Eats that fit your macros — want me to add them to your cart?",
  "I've generated your meal plan for today: Green Protein Bowl (breakfast), Quinoa Power Salad (lunch), and Salmon & Sweet Potato (dinner). Total: 1,640 kcal, 107g protein. Shall I order these?",
  "This week you burned 2,480 kcal across 4 activities. Your 7-day average is 620 kcal/session — 12% above last week. Great consistency!",
  "For a $20 budget, I recommend the Grilled Chicken Bowl (42g protein, $12.50) or the Salmon Power Bowl (38g protein, $18.90). Both hit your macro targets.",
  "Race day nutrition: 3g carbs/kg body weight pre-race, 30–60g carbs/hr during, 1.2g protein/kg post-race within 30 minutes. Want me to prep a specific plan?",
];

export default function AgentPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const replyIndex = useRef(0);

  useEffect(() => {
    if (!isSupabaseConfigured()) { setAuthorized(true); return; }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      setAuthorized(true);
    });
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const sendMessage = (text?: string) => {
    const content = text ?? input.trim();
    if (!content) return;
    setInput("");

    const userMsg: ChatMessage = {
      id: messages.length + 1,
      role: "user",
      content,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setThinking(true);

    setTimeout(() => {
      const reply = agentReplies[replyIndex.current % agentReplies.length];
      replyIndex.current++;
      setThinking(false);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          role: "assistant",
          content: reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 1200);
  };

  if (!authorized) return null;

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
              {[
                { label: "Calories", val: "1,640", target: "2,240", pct: 73, color: "#F97316" },
                { label: "Protein", val: "87g", target: "120g", pct: 73, color: "#10B981" },
                { label: "Carbs", val: "180g", target: "250g", pct: 72, color: "#F59E0B" },
              ].map((m) => (
                <div key={m.label} className="mb-2.5">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">{m.label}</span>
                    <span className="text-slate-400 font-mono">{m.val}/{m.target}</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${m.pct}%`, backgroundColor: m.color }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Last activity */}
            <div className="glass-card p-4 rounded-xl">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Last Activity</p>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-orange-400" />
                <p className="text-sm font-bold text-slate-100">5.2km Morning Run</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs text-orange-400 font-semibold">312 kcal</span>
                <span className="text-xs text-slate-600 ml-1">· 28 min · Zone 2</span>
              </div>
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
                <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
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
                    <p className="text-[10px] text-slate-600 px-1">{msg.time}</p>
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
