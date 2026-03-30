"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Marcus T.",
    title: "Triathlete · 12h/week",
    badge: "Beta tester",
    initials: "MT",
    avatarStyle: { background: "linear-gradient(135deg, #E07B54, #C4553A)" },
    quote:
      "I went from guessing my post-ride nutrition to nailing my carb targets every single day. The Strava sync is seamless. It just works.",
  },
  {
    name: "Priya K.",
    title: "Marathon Runner · 70km/week",
    badge: "Beta tester",
    initials: "PK",
    avatarStyle: { background: "linear-gradient(135deg, #F5C842, #D4A020)" },
    quote:
      "The AI chat is genuinely useful. It doesn't just tell me what to eat, it explains why, based on my actual training load and recovery needs.",
  },
  {
    name: "Jake R.",
    title: "Competitive Cyclist · 200km/week",
    badge: "Beta tester",
    initials: "JR",
    avatarStyle: { background: "linear-gradient(135deg, #8B9E6E, #6B7E50)" },
    quote:
      "The Uber Eats integration alone is worth it. I order food that actually fits my macros after every hard ride without thinking about it.",
  },
];

export function Testimonials() {
  return (
    <section className="relative py-16 lg:py-24 xl:py-28 px-6 overflow-hidden" style={{ backgroundColor: "#1C1410" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 lg:mb-14"
        >
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#F5C842" }}>
            Athletes
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: "#E8E0D0" }}>
            Who eat{" "}
            <span style={{ color: "#F5C842" }}>smarter.</span>
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
              className="p-7 flex flex-col gap-5 rounded-[20px]"
              style={{ backgroundColor: "rgba(255,220,150,0.04)", border: "1px solid rgba(255,220,150,0.10)", boxShadow: "0 4px 20px rgba(0,0,0,0.20)" }}
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="w-4 h-4" style={{ color: "#F5C842", fill: "#F5C842" }} />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm leading-relaxed flex-1" style={{ color: "rgba(232,224,208,0.65)" }}>
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2" style={{ borderTop: "1px solid rgba(255,220,150,0.10)" }}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                  style={{ ...t.avatarStyle, color: "#1C1410" }}
                >
                  {t.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: "#E8E0D0" }}>{t.name}</p>
                  <p className="text-xs" style={{ color: "rgba(232,224,208,0.45)" }}>{t.title}</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: "rgba(245,200,66,0.10)", color: "#F5C842", border: "1px solid rgba(245,200,66,0.25)" }}>
                  {t.badge}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
