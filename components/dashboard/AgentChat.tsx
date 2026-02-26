"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Bot, ExternalLink } from "lucide-react";

interface ChatMessage {
  id: number;
  role: "assistant" | "user";
  content: string;
  time: string;
}

const initialMessage: ChatMessage = {
  id: 1,
  role: "assistant",
  content:
    "I've analyzed your morning run. You burned 312 kcal at Zone 2. Based on your deficit, I've prepared a recovery meal plan. Want me to add the Green Protein Bowl to your Uber Eats cart?",
  time: "Just now",
};

export function AgentChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = {
      id: messages.length + 1,
      role: "user" as const,
      content: input,
      time: "Just now",
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          role: "assistant",
          content:
            "Got it! I'm updating your meal plan based on that. I'll optimize your macros for the next session.",
          time: "Just now",
        },
      ]);
    }, 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="w-80 glass-heavy rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-indigo-500/15"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100">Claw Agent</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
              <Link href="/agent" className="w-7 h-7 rounded-lg hover:bg-white/[0.05] flex items-center justify-center text-slate-500 hover:text-indigo-400 transition-colors" title="Open full chat">
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/[0.05] flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            </div>

            {/* Messages */}
            <div className="h-64 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white font-medium rounded-tr-sm"
                        : "bg-white/[0.05] text-slate-300 rounded-tl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/[0.07]">
              <div className="flex items-center gap-2 bg-white/[0.05] rounded-xl px-3 py-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask the Claw anything..."
                  className="flex-1 bg-transparent text-xs text-slate-200 placeholder:text-slate-600 outline-none"
                />
                <button
                  onClick={handleSend}
                  className="w-6 h-6 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/40 flex items-center justify-center text-indigo-400 transition-colors"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen((prev) => !prev)}
        className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:scale-110 hover:bg-indigo-500 transition-all duration-200"
        whileTap={{ scale: 0.95 }}
        animate={open ? {} : { y: [0, -4, 0] }}
        transition={open ? {} : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
