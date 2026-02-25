"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Marcus T.",
    title: "Triathlete",
    initials: "MT",
    avatarBg: "from-indigo-600 to-indigo-800",
    quote:
      "I went from guessing my post-ride nutrition to nailing my carb targets every single day. The Strava sync is seamless — it just works.",
  },
  {
    name: "Priya K.",
    title: "Marathon Runner",
    initials: "PK",
    avatarBg: "from-emerald-600 to-emerald-800",
    quote:
      "The AI chat is genuinely useful. It doesn't just tell me what to eat — it explains why, based on my actual training load and recovery needs.",
  },
  {
    name: "Jake R.",
    title: "Competitive Cyclist",
    initials: "JR",
    avatarBg: "from-orange-600 to-orange-800",
    quote:
      "The Uber Eats integration alone is worth every penny. I order food that actually fits my macros after every hard ride. Life-changing.",
  },
];

export function Testimonials() {
  return (
    <section className="relative py-28 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-4">
            Athletes
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-slate-100 tracking-tight">
            Who eat{" "}
            <span className="gradient-text">smarter.</span>
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="glass-card p-7 flex flex-col gap-5"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="w-4 h-4 text-indigo-400 fill-indigo-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-slate-300 text-sm leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.avatarBg} flex items-center justify-center text-sm font-black text-white flex-shrink-0`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
